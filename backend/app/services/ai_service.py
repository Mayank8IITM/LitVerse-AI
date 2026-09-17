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

    def _execute_with_fallback(self, keys: List[str], call_func: Callable[[str], Any]) -> Any:
        """
        Executes an AI call and falls back to the next key if a rate limit or error occurs.
        Uses a random starting key to distribute load.
        """
        if not keys:
            raise ValueError("No API keys configured for this provider.")
        
        # Shuffle keys to load balance across them
        available_keys = keys.copy()
        random.shuffle(available_keys)
        
        last_error = None
        for key in available_keys:
            try:
                return call_func(key)
            except Exception as e:
                logger.warning(f"AI Provider error with key {key[:8]}... : {str(e)}")
                last_error = e
                # Fall through to the next key in the loop
                continue
                
        logger.error("All AI Provider keys failed.")
        raise last_error

    def get_hint_from_groq(self, question: str, context: str, previous_hints: List[str]) -> str:
        """Uses Groq (Llama 3.1) for fast hint generation."""
        def _call(api_key: str):
            client = Groq(api_key=api_key)
            
            system_prompt = (
                "You are Pip, a magical fox and reading coach. "
                "Provide a short, gentle hint for the user. Do NOT give the direct answer. "
                "Keep it under 2 sentences."
            )
            
            user_prompt = f"Context: {context}\nQuestion: {question}\nPrevious Hints: {previous_hints}\nGive me a new hint."
            
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content

        return self._execute_with_fallback(self.groq_keys, _call)

    def explain_mistake_with_gemini(self, question: str, context: str, wrong_answer: str, correct_answer: str) -> str:
        """Uses Gemini 2.0 Flash for deeper explanation of mistakes."""
        def _call(api_key: str):
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = (
                "You are Pip, a magical reading coach for a 7-year-old child. "
                f"They read this: '{context}'\n"
                f"The question was: '{question}'\n"
                f"They guessed: '{wrong_answer}', but the correct answer is: '{correct_answer}'.\n"
                "Explain why their guess was wrong and why the correct answer is right. "
                "Use simple words, be encouraging, and keep it under 3 sentences."
            )
            
            response = model.generate_content(prompt)
            return response.text

        return self._execute_with_fallback(self.gemini_keys, _call)

ai_service = AIService()
