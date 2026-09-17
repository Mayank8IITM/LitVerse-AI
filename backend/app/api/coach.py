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
