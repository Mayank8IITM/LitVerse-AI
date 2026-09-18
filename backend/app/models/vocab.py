from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float
from app.db.database import Base
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.sql import func
import datetime
from app.models.child import Child

def generate_uuid():
    return str(uuid.uuid4())

class VocabWord(Base):
    __tablename__ = "vocab_words"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    
    word = Column(String, nullable=False)
    
    # SM-2 Algorithm Fields
    interval = Column(Integer, default=0) # Days until next review
    repetition = Column(Integer, default=0) # Consecutive correct reviews
    ease_factor = Column(Float, default=2.5)
    
    # When is this word due for review?
    next_review_at = Column(DateTime(timezone=True), default=func.now())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    child = relationship("Child")
