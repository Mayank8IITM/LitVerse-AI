from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from app.db.database import Base
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.sql import func

def generate_uuid():
    return str(uuid.uuid4())

class StorySession(Base):
    __tablename__ = "story_sessions"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    theme = Column(String, nullable=True) # e.g. "The Lantern Isles"
    current_node_id = Column(String, nullable=True) # ID of the active StoryNode
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    child = relationship("Child")
    nodes = relationship("StoryNode", back_populates="session", cascade="all, delete-orphan")

class StoryNode(Base):
    __tablename__ = "story_nodes"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False)
    
    passage_text = Column(String, nullable=False)
    vocabulary_words = Column(JSON, nullable=False) # List of target words
    
    # Adaptive metadata
    target_lexile = Column(Integer, nullable=False)
    focus_skill = Column(String, nullable=False)
    
    # Branching
    parent_node_id = Column(String, ForeignKey("story_nodes.id", ondelete="SET NULL"), nullable=True)
    choice_made = Column(String, nullable=True) # What the user picked to get HERE
    
    # Available choices to go NEXT
    branch_choices = Column(JSON, nullable=True) # e.g. [{"id": "a", "text": "Go left"}, {"id": "b", "text": "Go right"}]
    
    # Challenge associated with this node (MCQ)
    challenge_data = Column(JSON, nullable=True) # {"question": "...", "options": [...], "correct": "..."}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("StorySession", back_populates="nodes")
