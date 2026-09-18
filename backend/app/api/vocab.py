from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone

from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.vocab import VocabWord
from app.services.srs_engine import srs_engine

router = APIRouter()

class VocabWordResponse(BaseModel):
    id: str
    word: str
    
class ReviewVocabRequest(BaseModel):
    word_id: str
    quality: int # 0-5

@router.get("/due", response_model=List[VocabWordResponse])
def get_due_vocab(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch all vocabulary words that are due for review for the current user's child."""
    child = db.query(Child).filter(Child.parent_id == current_user.id).first()
    if not child:
        return []
        
    now = datetime.now(timezone.utc)
    
    due_words = db.query(VocabWord).filter(
        VocabWord.child_id == child.id,
        VocabWord.next_review_at <= now
    ).limit(20).all()
    
    return [{"id": w.id, "word": w.word} for w in due_words]

@router.post("/review")
def review_vocab(req: ReviewVocabRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Submit a review score (0-5) for a vocabulary word and update its spaced repetition intervals."""
    word = db.query(VocabWord).filter(VocabWord.id == req.word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Vocab word not found")
        
    # Calculate next SM-2 interval
    new_stats = srs_engine.calculate_next_review(
        quality=req.quality,
        ease_factor=word.ease_factor,
        interval=word.interval,
        repetition=word.repetition
    )
    
    # Update model
    word.interval = new_stats["interval"]
    word.repetition = new_stats["repetition"]
    word.ease_factor = new_stats["ease_factor"]
    word.next_review_at = new_stats["next_review_at"]
    
    db.commit()
    
    return {"status": "success", "next_review_at": word.next_review_at}
