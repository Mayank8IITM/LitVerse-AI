from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.child import Child, LearnerModel
from app.models.story import StorySession, StoryNode
from app.models.vocab import VocabWord
from app.services.adaptive_engine import adaptive_engine
from app.services.story_engine import story_engine

router = APIRouter()

class StartStoryRequest(BaseModel):
    theme: str = "The Lantern Isles"

class BranchStoryRequest(BaseModel):
    current_node_id: str
    choice_id: str # 'a' or 'b'
    challenge_correct: bool
    skill_tested: str

@router.post("/start")
def start_story(req: StartStoryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Get the child's LearnerModel
    child = db.query(Child).filter(Child.parent_id == current_user.id).first()
    if not child:
        # Auto-create child for simplicity (1 child per account)
        child = Child(parent_id=current_user.id, display_name=current_user.name or "Learner")
        db.add(child)
        db.commit()
        db.refresh(child)
        
    learner_model = child.learner_model
    if not learner_model:
        learner_model = LearnerModel(child_id=child.id)
        db.add(learner_model)
        db.commit()

    # 2. Calculate Adaptive Difficulty
    diff_profile = adaptive_engine.calculate_difficulty_profile(learner_model)
    
    # 3. Generate Story Opening
    story_data = story_engine.generate_opening(diff_profile, theme=req.theme)
    
    # 4. Save Session and Node
    session = StorySession(child_id=child.id, theme=req.theme)
    db.add(session)
    db.commit() # to get session.id
    
    node = StoryNode(
        session_id=session.id,
        passage_text=story_data["passage_text"],
        vocabulary_words=story_data["vocabulary_words"],
        target_lexile=diff_profile["target_lexile"],
        focus_skill=diff_profile["focus_skill"],
        branch_choices=story_data["branch_choices"],
        challenge_data=story_data.get("challenges", [])
    )
    db.add(node)
    db.commit()
    
    session.current_node_id = node.id
    db.commit()
    
    # Auto-add new vocabulary words for spaced repetition
    for word_str in story_data["vocabulary_words"]:
        clean_word = word_str.lower().strip()
        existing_word = db.query(VocabWord).filter(
            VocabWord.child_id == child.id,
            VocabWord.word == clean_word
        ).first()
        
        if not existing_word:
            new_vocab = VocabWord(child_id=child.id, word=clean_word)
            db.add(new_vocab)
    db.commit()
    
    return {
        "session_id": session.id,
        "node_id": node.id,
        "passage_text": node.passage_text,
        "vocabulary_words": node.vocabulary_words,
        "branch_choices": node.branch_choices,
        "challenge_data": node.challenge_data,
        "difficulty": diff_profile
    }

@router.post("/{session_id}/branch")
def branch_story(session_id: str, req: BranchStoryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Fetch current session and node
    session = db.query(StorySession).filter(StorySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    current_node = db.query(StoryNode).filter(StoryNode.id == req.current_node_id).first()
    if not current_node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # 2. Update LearnerModel based on challenge result
    learner_model = session.child.learner_model
    adaptive_engine.update_learner_scores(learner_model, req.skill_tested, req.challenge_correct)
    db.commit()
    
    # 3. Find the text of the choice made
    choices = current_node.branch_choices or []
    choice_text = next((c["text"] for c in choices if c["id"] == req.choice_id), "Continued the journey.")
    current_node.choice_made = choice_text
    db.commit()
    
    # 4. Count existing nodes in this session to see if we should conclude
    node_count = db.query(StoryNode).filter(StoryNode.session_id == session_id).count()
    is_conclusion = (node_count >= 3) # Story ends on the 4th passage
    
    # 5. Calculate new Difficulty Profile
    diff_profile = adaptive_engine.calculate_difficulty_profile(learner_model)
    
    # 6. Generate Next Branch (or Conclusion)
    story_data = story_engine.generate_branch(
        previous_passage=current_node.passage_text,
        choice_made=choice_text,
        difficulty_profile=diff_profile,
        theme=session.theme,
        is_conclusion=is_conclusion
    )
    
    # 6. Save Next Node
    next_node = StoryNode(
        session_id=session.id,
        parent_node_id=current_node.id,
        passage_text=story_data["passage_text"],
        vocabulary_words=story_data["vocabulary_words"],
        target_lexile=diff_profile["target_lexile"],
        focus_skill=diff_profile["focus_skill"],
        branch_choices=story_data["branch_choices"],
        challenge_data=story_data.get("challenges", [])
    )
    db.add(next_node)
    db.commit()
    
    session.current_node_id = next_node.id
    db.commit()
    
    # Auto-add new vocabulary words for spaced repetition
    for word_str in story_data.get("vocabulary_words", []):
        clean_word = word_str.lower().strip()
        existing_word = db.query(VocabWord).filter(
            VocabWord.child_id == session.child_id,
            VocabWord.word == clean_word
        ).first()
        
        if not existing_word:
            new_vocab = VocabWord(child_id=session.child_id, word=clean_word)
            db.add(new_vocab)
            
    # If this was the conclusion, increment total_sessions to progress the map
    if is_conclusion:
        learner_model.total_sessions += 1
        
    db.commit()
    
    return {
        "session_id": session.id,
        "node_id": next_node.id,
        "passage_text": next_node.passage_text,
        "vocabulary_words": next_node.vocabulary_words,
        "branch_choices": next_node.branch_choices,
        "challenge_data": next_node.challenge_data,
        "difficulty": diff_profile
    }
