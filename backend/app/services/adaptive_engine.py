from typing import Dict, Any

class AdaptiveEngine:
    """
    Core engine for calculating the Zone of Proximal Development (ZPD).
    """

    def calculate_difficulty_profile(self, learner_model: Any) -> Dict[str, Any]:
        """
        Takes a SQLAlchemy LearnerModel and returns a difficulty profile dict
        used to prompt the StoryEngine.
        """
        
        # 1. Calculate overall score average
        scores = {
            "vocabulary": learner_model.vocabulary,
            "literal_comprehension": learner_model.literal_comprehension,
            "inference": learner_model.inference,
            "prediction": learner_model.prediction,
            "evidence_finding": learner_model.evidence_finding,
            "reading_fluency": learner_model.reading_fluency
        }
        
        avg_score = sum(scores.values()) / len(scores)
        
        # 2. Identify the weakest skill to focus the next challenge on
        focus_skill = min(scores, key=scores.get)
        
        # If all scores are 0 (new user), default to literal_comprehension
        if avg_score == 0:
            focus_skill = "literal_comprehension"
            
        # 3. Adjust target Lexile
        # ZPD Logic: If doing great, push slightly harder. If struggling, ease up.
        base_lexile = learner_model.current_lexile
        
        if avg_score > 85:
            target_lexile = base_lexile + 20
        elif avg_score < 50 and avg_score > 0:
            target_lexile = max(100, base_lexile - 20)  # Don't drop below 100L
        else:
            target_lexile = base_lexile
            
        # 4. Determine syntactical complexity based on Lexile
        if target_lexile < 300:
            complexity = "Simple sentences, direct subject-verb-object structure, highly repetitive."
            word_count = 50
        elif target_lexile < 600:
            complexity = "Mix of simple and compound sentences, introduces conjunctions (and, but, so)."
            word_count = 100
        else:
            complexity = "Complex sentences with dependent clauses, richer vocabulary, implicit meaning."
            word_count = 150
            
        return {
            "target_lexile": target_lexile,
            "focus_skill": focus_skill,
            "sentence_complexity": complexity,
            "recommended_word_count": word_count,
            "learner_avg_score": round(avg_score, 1)
        }

    def update_learner_scores(self, learner_model: Any, skill: str, correct: bool) -> None:
        """
        Updates a specific skill score based on a challenge result.
        Uses a simple moving average or weighted update.
        """
        current_score = getattr(learner_model, skill, 50.0)
        
        # Weight recent performance heavily (e.g., 80% old, 20% new)
        # If correct, new performance is 100. If wrong, 0.
        new_performance = 100.0 if correct else 0.0
        
        updated_score = (current_score * 0.8) + (new_performance * 0.2)
        
        setattr(learner_model, skill, updated_score)
        
        # Also bump Lexile slightly if correct, drop if wrong
        if correct:
            learner_model.current_lexile += 2
        else:
            learner_model.current_lexile = max(100, learner_model.current_lexile - 5)

# Singleton instance
adaptive_engine = AdaptiveEngine()
