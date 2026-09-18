from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
import tempfile
import os
from groq import Groq
from app.core.config import settings
from pydantic import BaseModel
from typing import List

from app.services.ai_service import ai_service
# In a full implementation, you would use Depends(get_current_user) to secure this

router = APIRouter()

class HintRequest(BaseModel):
    question: str
    context: str
    previous_hints: List[str] = []

class ExplainRequest(BaseModel):
    question: str
    context: str
    wrong_answer: str
    correct_answer: str

@router.post("/hint")
async def get_hint(request: HintRequest):
    """Get a progressive hint using Groq."""
    try:
        hint = ai_service.get_hint_from_groq(
            question=request.question,
            context=request.context,
            previous_hints=request.previous_hints
        )
        return {"hint": hint}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def get_explanation(request: ExplainRequest):
    """Get an explanation for a mistake using Gemini."""
    try:
        explanation = ai_service.explain_mistake_with_gemini(
            question=request.question,
            context=request.context,
            wrong_answer=request.wrong_answer,
            correct_answer=request.correct_answer
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio using Groq Whisper API for the Read-Aloud feature."""
    if not settings.groq_keys_list:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
        
    try:
        # Create a temporary file to hold the audio data
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            client = Groq(api_key=settings.groq_keys_list[0])
            with open(tmp_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                  file=(file.filename, audio_file.read()),
                  model="whisper-large-v3-turbo",
                  response_format="json",
                  language="en"
                )
            return {"text": transcription.text}
        finally:
            os.remove(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

from app.db.database import get_db
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.models.user import User
from app.models.child import Child, LearnerModel

@router.get("/stats")
async def get_learner_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fast endpoint to fetch stats for the World Map."""
    child = db.query(Child).filter(Child.parent_id == current_user.id).first()
    if not child:
        return {"sessions": 0, "lexile": 200, "name": "Reader"}
        
    learner = db.query(LearnerModel).filter(LearnerModel.child_id == child.id).first()
    if not learner:
        return {"sessions": 0, "lexile": 200, "name": child.display_name}
        
    return {
        "sessions": learner.total_sessions,
        "lexile": learner.current_lexile,
        "name": child.display_name
    }

@router.get("/report")
async def get_parent_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate a weekly parent report using Gemini."""
    child = db.query(Child).filter(Child.parent_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
        
    learner = db.query(LearnerModel).filter(LearnerModel.child_id == child.id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner data not found")
        
    stats = {
        "vocabulary": learner.vocabulary,
        "inference": learner.inference,
        "literal_comprehension": learner.literal_comprehension
    }
    
    # Calculate real vocabulary distribution
    from app.models.vocab import VocabWord
    all_vocab = db.query(VocabWord).filter(VocabWord.child_id == child.id).all()
    
    mastered_count = sum(1 for w in all_vocab if w.repetition >= 3)
    learning_count = sum(1 for w in all_vocab if 0 < w.repetition < 3)
    struggling_count = sum(1 for w in all_vocab if w.repetition == 0 and w.ease_factor <= 2.5)
    
    vocab_distribution = [
        {"name": "Mastered", "value": mastered_count, "color": "var(--success)"},
        {"name": "Learning", "value": learning_count, "color": "var(--warning)"},
        {"name": "Struggling", "value": struggling_count, "color": "var(--danger)"}
    ]
    
    # Top 3 words to practice
    struggling_words = db.query(VocabWord)\
        .filter(VocabWord.child_id == child.id)\
        .order_by(VocabWord.ease_factor.asc(), VocabWord.repetition.asc())\
        .limit(3).all()
    words_to_practice = [w.word for w in struggling_words]
    
    try:
        report = ai_service.generate_parent_report_with_gemini(
            child_name=child.display_name,
            lexile=learner.current_lexile,
            stats=stats
        )
    except Exception as e:
        report = "Sorry for the inconvenience, we are using Free APIs and the API limit has been reached. Your child's real-time performance data has still been successfully tracked below."

    return {
        "report": report,
        "lexile": learner.current_lexile,
        "sessions": learner.total_sessions,
        "stats": stats,
        "vocab_distribution": vocab_distribution,
        "words_to_practice": words_to_practice
    }

class FluencyFeedbackRequest(BaseModel):
    target_text: str
    transcript: str

@router.post("/fluency-feedback")
async def get_fluency_feedback(req: FluencyFeedbackRequest, current_user: User = Depends(get_current_user)):
    """Generate personalized pronunciation feedback using Gemini."""
    try:
        feedback = ai_service.generate_fluency_feedback(
            target_text=req.target_text,
            transcript=req.transcript
        )
        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")
