"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import WordHighlight from "./WordHighlight";

export default function PassageDisplay({ text, vocabularyWords, onWordClick }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple tokenization for highlighting words
  const renderText = () => {
    // Regex matches words and preserves punctuation
    const tokens = text.split(/(\b[\w']+\b|\s+|[^\w\s]+)/).filter(Boolean);
    
    // Normalize vocabulary words for comparison
    const vocabSet = new Set(vocabularyWords.map(v => v.toLowerCase()));

    return tokens.map((token, index) => {
      // If it's just whitespace or punctuation, return it directly
      if (!/^\b[\w']+\b$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      const isVocab = vocabSet.has(token.toLowerCase());
      
      return (
        <WordHighlight 
          key={index} 
          word={token} 
          isVocabulary={isVocab} 
          onClick={onWordClick} 
        />
      );
    });
  };

  const handlePlayTTS = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Using Web Speech API as a lightweight placeholder for Kokoro-JS
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to pick a nice English voice if available
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (goodVoice) utterance.voice = goodVoice;
    
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly friendlier pitch

    utterance.onend = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        fontFamily: 'var(--font-literata), serif',
        fontSize: 'clamp(18px, 2.5vw, 24px)',
        lineHeight: '1.8',
        letterSpacing: '0.02em',
        wordSpacing: '0.05em',
        color: '#f8fafc',
        maxWidth: '65ch',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <button 
        onClick={handlePlayTTS}
        style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          color: isPlaying ? '#ef4444' : '#60a5fa',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '0.875rem'
        }}
      >
        {isPlaying ? '🛑 Stop Reading' : '🔊 Read to me (Pip)'}
      </button>
      
      <p style={{ margin: 0, marginTop: '20px' }}>
        {renderText()}
      </p>
    </motion.div>
  );
}
