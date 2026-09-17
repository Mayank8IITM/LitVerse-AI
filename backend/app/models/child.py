from sqlalchemy import Column, String, DateTime, ForeignKey, func, Float, Integer, Boolean, JSON
from app.db.database import Base
from sqlalchemy.orm import relationship
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Child(Base):
    __tablename__ = "children"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    parent_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    display_name = Column(String, nullable=False)
    avatar_id = Column(String, default="luna-default")
    reading_level = Column(String, default="A")  # A, B, C mapping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    parent = relationship("User", back_populates="children")
    learner_model = relationship("LearnerModel", back_populates="child", uselist=False, cascade="all, delete-orphan")
    challenge_attempts = relationship("ChallengeAttempt", back_populates="child", cascade="all, delete-orphan")

class LearnerModel(Base):
    __tablename__ = "learner_models"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("children.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Educational Metrics (0.0 to 100.0)
    vocabulary = Column(Float, default=0.0)
    literal_comprehension = Column(Float, default=0.0)
    inference = Column(Float, default=0.0)
    prediction = Column(Float, default=0.0)
    evidence_finding = Column(Float, default=0.0)
    reading_fluency = Column(Float, default=0.0)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    child = relationship("Child", back_populates="learner_model")

class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(String, nullable=False)
    chapter_id = Column(String, nullable=False)
    skill = Column(String, nullable=False)
    difficulty = Column(Integer, nullable=False)
    correct = Column(Boolean, nullable=False)
    attempt_number = Column(Integer, nullable=False)
    hints_used = Column(Integer, default=0)
    used_explain = Column(Boolean, default=False)
    reread_count = Column(Integer, default=0)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    child = relationship("Child", back_populates="challenge_attempts")
