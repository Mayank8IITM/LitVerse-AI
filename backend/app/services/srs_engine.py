from datetime import datetime, timedelta, timezone
from typing import Dict, Any

class SRSEngine:
    """
    Spaced Repetition System (SRS) using a variant of the SM-2 algorithm.
    """

    def calculate_next_review(self, quality: int, ease_factor: float, interval: int, repetition: int) -> Dict[str, Any]:
        """
        quality: 
          0-1: Again (Complete blackout / incorrect)
          2-3: Hard (Correct but required effort)
          4-5: Easy (Correct instantly)
        """
        
        # If the user failed, reset repetition
        if quality < 3:
            repetition = 0
            interval = 1
        else:
            if repetition == 0:
                interval = 1
            elif repetition == 1:
                interval = 6
            else:
                interval = round(interval * ease_factor)
                
            repetition += 1

        # Calculate new ease factor
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        
        # Enforce boundaries for ease factor
        if ease_factor < 1.3:
            ease_factor = 1.3
            
        next_review_at = datetime.now(timezone.utc) + timedelta(days=interval)
        
        return {
            "interval": interval,
            "repetition": repetition,
            "ease_factor": round(ease_factor, 2),
            "next_review_at": next_review_at
        }

srs_engine = SRSEngine()
