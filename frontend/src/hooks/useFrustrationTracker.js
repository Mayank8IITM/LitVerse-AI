import { useState, useEffect, useRef } from 'react';

export function useFrustrationTracker(challengeActive) {
  const [frustrationScore, setFrustrationScore] = useState(0);
  const [isFrustrated, setIsFrustrated] = useState(false);
  const timerRef = useRef(null);

  const threshold = 10;

  useEffect(() => {
    // If a challenge is active, start a timer
    if (challengeActive) {
      timerRef.current = setInterval(() => {
        // Increase frustration score every 10 seconds of idle time
        setFrustrationScore(prev => prev + 2);
      }, 10000);
    } else {
      // Clear timer and reset score when challenge completes
      clearInterval(timerRef.current);
      setFrustrationScore(0);
      setIsFrustrated(false);
    }

    return () => clearInterval(timerRef.current);
  }, [challengeActive]);

  useEffect(() => {
    if (frustrationScore >= threshold && !isFrustrated) {
      setIsFrustrated(true);
    }
  }, [frustrationScore, isFrustrated]);

  const recordError = () => {
    setFrustrationScore(prev => prev + 5); // Errors are highly frustrating
  };
  
  const recordClick = () => {
    setFrustrationScore(prev => prev + 1); // Rapid clicks add up
  };

  const resetFrustration = () => {
    setFrustrationScore(0);
    setIsFrustrated(false);
  };

  return { isFrustrated, recordError, recordClick, resetFrustration, frustrationScore };
}
