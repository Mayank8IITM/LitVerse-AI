import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from app.services.ai_service import ai_service
from app.services.adaptive_engine import adaptive_engine

logger = logging.getLogger(__name__)

class StoryEngine:
    
    def _generate_with_gemini(self, prompt: str) -> Dict[str, Any]:
        """Helper to call Gemini and parse JSON."""
        def _call(api_key: str, model_name: str):
            genai.configure(api_key=api_key)
            # Use JSON mode for structured output
            model = genai.GenerativeModel(
                model_name,
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)
            return json.loads(response.text)
            
        gemini_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
        return ai_service._execute_with_fallback(ai_service.gemini_keys, gemini_models, _call)

    def generate_opening(self, difficulty_profile: Dict[str, Any], theme: str = "The Lantern Isles") -> Dict[str, Any]:
        """
        Generates the first node of a new story.
        """
        target_lexile = difficulty_profile["target_lexile"]
        focus_skill = difficulty_profile["focus_skill"]
        complexity = difficulty_profile["sentence_complexity"]
        word_count = difficulty_profile["recommended_word_count"]
        
        prompt = f"""
You are an expert children's author writing an interactive story.
Theme: {theme}
Target Lexile: {target_lexile}L
Sentence Complexity: {complexity}
Length: Around {word_count} words.

Write the opening passage of a fantasy adventure. 
Then, identify 2-3 target vocabulary words from the passage that are appropriate for this Lexile level.
Then, generate 2 branching choices for what the main character should do next.
Finally, generate exactly 2 distinct multiple-choice reading comprehension questions. Ensure they focus on the skill: "{focus_skill}".

Output EXACTLY as this JSON structure:
{{
    "passage_text": "The story text here...",
    "vocabulary_words": ["word1", "word2"],
    "branch_choices": [
        {{"id": "a", "text": "Choice A text"}},
        {{"id": "b", "text": "Choice B text"}}
    ],
    "challenges": [
        {{
            "question": "Question 1 text?",
            "options": ["wrong1", "correct", "wrong2", "wrong3"],
            "correct": "correct"
        }},
        {{
            "question": "Question 2 text?",
            "options": ["wrong1", "correct", "wrong2", "wrong3"],
            "correct": "correct"
        }}
    ]
}}
"""
        return self._generate_with_gemini(prompt)

    def generate_branch(self, previous_passage: str, choice_made: str, difficulty_profile: Dict[str, Any], theme: str = "The Lantern Isles", is_conclusion: bool = False) -> Dict[str, Any]:
        """
        Continues the story based on the user's choice. If is_conclusion is True, wraps up the story.
        """
        target_lexile = difficulty_profile["target_lexile"]
        focus_skill = difficulty_profile["focus_skill"]
        complexity = difficulty_profile["sentence_complexity"]
        word_count = difficulty_profile["recommended_word_count"]
        
        if is_conclusion:
            prompt = f"""
You are an expert children's author writing an interactive story.
Theme: {theme}
Target Lexile: {target_lexile}L
Sentence Complexity: {complexity}
Length: Around {word_count} words.

Previous passage: "{previous_passage}"
The reader chose to: "{choice_made}"

Write the final, satisfying concluding passage of the story. Tie up the adventure beautifully.
Identify 1-2 target vocabulary words.
Because this is the end, do NOT generate branching choices or a challenge.

Output EXACTLY as this JSON structure:
{{
    "passage_text": "The story text here...",
    "vocabulary_words": ["word1"],
    "branch_choices": [],
    "challenges": []
}}
"""
        else:
            prompt = f"""
You are an expert children's author writing an interactive story.
Theme: {theme}
Target Lexile: {target_lexile}L
Sentence Complexity: {complexity}
Length: Around {word_count} words.

Previous passage: "{previous_passage}"
The reader chose to: "{choice_made}"

Write the next passage continuing from that choice. 
Identify 2-3 target vocabulary words.
Generate 2 branching choices for what to do next.
Generate exactly 2 distinct multiple-choice reading comprehension questions. Ensure they focus on the skill: "{focus_skill}".

Output EXACTLY as this JSON structure:
{{
    "passage_text": "The story text here...",
    "vocabulary_words": ["word1", "word2"],
    "branch_choices": [
        {{"id": "a", "text": "Choice A text"}},
        {{"id": "b", "text": "Choice B text"}}
    ],
    "challenges": [
        {{
            "question": "Question 1 text?",
            "options": ["wrong1", "correct", "wrong2", "wrong3"],
            "correct": "correct"
        }},
        {{
            "question": "Question 2 text?",
            "options": ["wrong1", "correct", "wrong2", "wrong3"],
            "correct": "correct"
        }}
    ]
}}
"""
        return self._generate_with_gemini(prompt)

story_engine = StoryEngine()
