import logging
import random
from typing import List, Callable, Any
from groq import Groq
import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.groq_keys = settings.groq_keys_list
        self.gemini_keys = settings.gemini_keys_list

    def _execute_with_fallback(self, keys: List[str], models: List[str], call_func: Callable[[str, str], Any]) -> Any:
        """
        Executes an AI call and falls back to the next model/key if a rate limit or error occurs.
        Uses a random starting key to distribute load.
        """
        if not keys:
            raise ValueError("No API keys configured for this provider.")
        
        # Shuffle keys to load balance across them
        available_keys = keys.copy()
        random.shuffle(available_keys)
        
        last_error = None
        for key in available_keys:
            for model_name in models:
                try:
                    return call_func(key, model_name)
                except Exception as e:
                    logger.warning(f"AI Provider error with key {key[:8]}... and model {model_name}: {str(e)}")
                    last_error = e
                    continue
                
        logger.error("All AI Provider keys and models failed.")
        raise last_error

    def get_hint_from_groq(self, question: str, context: str, previous_hints: List[str]) -> str:
        """Uses Groq (Llama 3.1) for fast hint generation."""
        def _call(api_key: str, model_name: str):
            client = Groq(api_key=api_key)
            
            system_prompt = (
                "You are Pip, an experienced reading coach. "
                "Provide a short, gentle hint for the user. Do NOT give the direct answer. "
                "Keep it under 2 sentences."
            )
            
            user_prompt = f"Context: {context}\nQuestion: {question}\nPrevious Hints: {previous_hints}\nGive me a new hint."
            
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=model_name,
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content

        groq_models = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "groq/compound-mini"]
        return self._execute_with_fallback(self.groq_keys, groq_models, _call)

    def explain_mistake_with_gemini(self, question: str, context: str, wrong_answer: str, correct_answer: str) -> str:
        """Uses Gemini 2.5 Flash for deeper explanation of mistakes or vocabulary words."""
        def _call(api_key: str, model_name: str):
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            
            if not wrong_answer:
                # It's a vocabulary definition request
                prompt = (
                    f"You are Pip, an experienced reading coach. A child asked you to explain what a word means.\n"
                    f"Word/Question: {question}\n"
                    f"Context from the story they are reading: \"{context}\"\n\n"
                    "Explain the meaning of this word specifically in the context of the story passage provided. "
                    "Do NOT just give a boring dictionary definition. Use incredibly simple, kid-friendly language. "
                    "Keep it to 2-3 short sentences. Be encouraging and fun!"
                )
            else:
                # It's a mistake explanation request
                prompt = (
                    f"You are Pip, an experienced AI reading coach. The child answered a question incorrectly.\n"
                    f"Story Context: \"{context}\"\n"
                    f"Question they were asked: \"{question}\"\n"
                    f"Their incorrect answer: \"{wrong_answer}\"\n"
                    f"The correct answer: \"{correct_answer}\"\n\n"
                    "Briefly explain WHY their answer was wrong and why the correct answer is right, based on the story. "
                    "Keep it incredibly positive, gentle, and simple for a child to understand. 2-3 sentences max."
                )
                
            response = model.generate_content(prompt)
            return response.text

        gemini_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
        return self._execute_with_fallback(self.gemini_keys, gemini_models, _call)

    def generate_parent_report_with_gemini(self, child_name: str, lexile: int, stats: dict) -> str:
        """Uses Gemini 2.5 Flash to generate a weekly parent report."""
        def _call(api_key: str, model_name: str):
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            
            prompt = (
                f"You are Pip, an experienced reading coach. Write a short, encouraging weekly progress report "
                f"for a parent about their child, {child_name}.\n\n"
                f"Data:\n"
                f"- Current Reading Level: {lexile}L\n"
                f"- Vocabulary Score: {stats['vocabulary']}/100\n"
                f"- Inference Score: {stats['inference']}/100\n"
                f"- Literal Comprehension Score: {stats['literal_comprehension']}/100\n\n"
                "Write exactly one paragraph. Celebrate their strengths, gently note what they are learning, and keep the tone warm, personable, and professional. Also give a suggestion that will help the child improve in their weaker areas."
            )
            
            response = model.generate_content(prompt)
            return response.text

        gemini_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
        return self._execute_with_fallback(self.gemini_keys, gemini_models, _call)

    def generate_fluency_feedback(self, target_text: str, transcript: str) -> str:
        """Uses Gemini 2.5 Flash to generate feedback on pronunciation and fluency."""
        def _call(api_key: str, model_name: str):
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            
            prompt = (
                f"You are Pip, an experienced reading coach for children. The child just completed a 60-second reading speedrun.\n"
                f"Here is the exact text they were supposed to read:\n\"{target_text}\"\n\n"
                f"Here is what the microphone actually heard them say:\n\"{transcript}\"\n\n"
                "Compare the two texts. Write a short, helpful feedback message (2-3 sentences max) for the child. "
                "Point out 1 or 2 specific words they might have mispronounced or skipped based on the transcript. "
                "Keep it incredibly positive, personable, and fun."
            )
            
            response = model.generate_content(prompt)
            return response.text

        gemini_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
        return self._execute_with_fallback(self.gemini_keys, gemini_models, _call)

ai_service = AIService()
