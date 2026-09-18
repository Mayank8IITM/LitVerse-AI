"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Check, X, MoveRight } from 'lucide-react';
import api from '@/lib/api';

export default function VocabReview() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [dueWords, setDueWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [isFetchingDef, setIsFetchingDef] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDueWords();
    }
  }, [user]);

  const fetchDueWords = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/vocab/due');
      setDueWords(response.data);
    } catch (e) {
      console.error("Failed to fetch vocab", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefinition = async (word) => {
    setIsFetchingDef(true);
    try {
      const response = await api.post('/api/coach/explain', {
        question: `What does the word '${word}' mean? Keep it simple for a kid.`,
        context: word,
        wrong_answer: "",
        correct_answer: ""
      });
      setDefinition(response.data.explanation);
    } catch (e) {
      setDefinition("Pip's magic is resting, but this is a great word to look up!");
    } finally {
      setIsFetchingDef(false);
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      fetchDefinition(dueWords[currentIndex].word);
    }
  };

  const handleReview = async (quality) => {
    const word = dueWords[currentIndex];
    
    try {
      await api.post('/api/vocab/review', {
        word_id: word.id,
        quality: quality
      });
      
      // Move to next word
      setIsFlipped(false);
      setDefinition(null);
      setCurrentIndex(prev => prev + 1);
      
    } catch (e) {
      console.error("Failed to submit review", e);
    }
  };

  if (loading || !user) return null;

  if (isLoading) {
    return (
      <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your words...</p>
      </main>
    );
  }

  if (currentIndex >= dueWords.length) {
    return (
      <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-2xl)' }} className="card">
          <Brain size={64} color="var(--success)" style={{ margin: '0 auto var(--space-md)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>All caught up!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: 'var(--space-xl)' }}>
            Your brain is growing stronger. Come back tomorrow for more!
          </p>
          <button className="btn btn-primary btn-pill" onClick={() => router.push('/play/story')}>
            Read a Story
          </button>
        </motion.div>
      </main>
    );
  }

  const currentWord = dueWords[currentIndex];
  const remaining = dueWords.length - currentIndex;

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span>Vocabulary Review</span>
          <span>{remaining} word{remaining !== 1 ? 's' : ''} left</span>
        </header>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: 'var(--space-2xl)', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / dueWords.length) * 100}%` }}
            style={{ height: '100%', backgroundColor: 'var(--accent)' }}
          />
        </div>

        {/* Flashcard */}
        <div style={{ perspective: '1000px', marginBottom: 'var(--space-2xl)' }}>
          <motion.div
            onClick={handleFlip}
            animate={{ rotateX: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              width: '100%',
              minHeight: '300px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              cursor: isFlipped ? 'default' : 'pointer'
            }}
          >
            {/* Front */}
            <div className="card" style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--accent-soft)',
              backgroundColor: 'var(--bg-card)'
            }}>
              <span style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {currentWord.word}
              </span>
              <span style={{ marginTop: 'var(--space-lg)', color: 'var(--accent)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} /> Tap to reveal meaning
              </span>
            </div>

            {/* Back */}
            <div className="card" style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--border)',
              backgroundColor: 'var(--bg-base)',
              padding: 'var(--space-xl)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
                {currentWord.word}
              </span>
              
              {isFetchingDef ? (
                <span style={{ color: 'var(--text-muted)' }}>Pip is thinking...</span>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6 }}>
                  {definition}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {isFlipped && !isFetchingDef && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}
            >
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--error-soft)', color: 'var(--error)', padding: 'var(--space-md)' }}
                onClick={() => handleReview(1)}
              >
                <X size={20} style={{ margin: '0 auto var(--space-xs)' }} />
                Didn't Know
              </button>
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', padding: 'var(--space-md)' }}
                onClick={() => handleReview(3)}
              >
                <MoveRight size={20} style={{ margin: '0 auto var(--space-xs)' }} />
                Hard
              </button>
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: 'var(--space-md)' }}
                onClick={() => handleReview(5)}
              >
                <Check size={20} style={{ margin: '0 auto var(--space-xs)' }} />
                Easy
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
