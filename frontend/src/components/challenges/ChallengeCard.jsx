"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function ChallengeCard({ question, options, correctAnswer, onComplete, onHintRequest }) {
  const [selected, setSelected] = useState(null);
  const [isWrong, setIsWrong] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    
    if (option === correctAnswer) {
      setIsWrong(false);
      // Trigger confetti on success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'] // Gold colors
      });
      
      // Let the parent know they passed after a short delay
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } else {
      setIsWrong(true);
      // Remove the wrong state after the shake animation completes
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="challenge-card"
      style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        borderTop: '4px solid #3b82f6',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
          {question}
        </h3>
        
        {onHintRequest && (
          <button 
            onClick={onHintRequest}
            style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: '#60a5fa', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            💡 Hint
          </button>
        )}
      </div>

      <motion.div 
        animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <AnimatePresence>
          {options.map((option, idx) => {
            const isSelected = selected === option;
            const isCorrect = isSelected && option === correctAnswer;
            const isIncorrect = isSelected && option !== correctAnswer;

            let bgColor = '#334155';
            let borderColor = '#475569';
            
            if (isCorrect) {
              bgColor = 'rgba(16, 185, 129, 0.1)';
              borderColor = '#10b981';
            } else if (isIncorrect) {
              bgColor = 'rgba(239, 68, 68, 0.1)';
              borderColor = '#ef4444';
            } else if (isSelected) {
              bgColor = 'rgba(59, 130, 246, 0.1)';
              borderColor = '#3b82f6';
            }

            return (
              <motion.button
                key={idx}
                whileHover={!selected ? { scale: 1.02, backgroundColor: '#475569' } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
                onClick={() => !selected && handleSelect(option)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: '#f8fafc',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-inter), sans-serif',
                  cursor: selected ? 'default' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCorrect ? '#10b981' : isIncorrect ? '#ef4444' : 'transparent'
                }}>
                  {isCorrect && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                  {isIncorrect && <span style={{ color: 'white', fontSize: '12px' }}>✕</span>}
                </div>
                {option}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
