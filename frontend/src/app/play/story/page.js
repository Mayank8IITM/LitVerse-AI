"use client";

import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Wand2, MessageCircleHeart, X } from 'lucide-react';
import PassageDisplay from '@/components/reading/PassageDisplay';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import StoryChoiceCard from '@/components/reading/StoryChoiceCard';
import { useFrustrationTracker } from '@/hooks/useFrustrationTracker';
import api from '@/lib/api';

export default function Play() {
  const { user, loading } = useAuth();
  const { activeSession, currentNode, isLoading, isGenerating, startSession, makeChoice } = useGame();
  const router = useRouter();
  
  // Normalize challenges (supports old DB entries with single object, or new ones with arrays)
  const challenges = currentNode?.challenge_data 
    ? (Array.isArray(currentNode.challenge_data) ? currentNode.challenge_data : [currentNode.challenge_data])
    : [];

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [allChallengesComplete, setAllChallengesComplete] = useState(false);
  const [lastChallengeCorrect, setLastChallengeCorrect] = useState(false);
  const [previousHints, setPreviousHints] = useState([]);
  
  // Beautiful Pip Modal State
  const [pipMessage, setPipMessage] = useState(null); // { title: string, content: string }
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isFrustrated, recordError, recordClick, resetFrustration } = useFrustrationTracker(!!currentNode && !allChallengesComplete);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Reset challenge state when node changes
  useEffect(() => {
    setCurrentChallengeIndex(0);
    setLastChallengeCorrect(false);
    setPreviousHints([]);
    setIsModalOpen(false);
    
    // If it's a conclusion node with no challenges, skip to the choices/end screen
    if (!challenges || challenges.length === 0) {
      setAllChallengesComplete(true);
    } else {
      setAllChallengesComplete(false);
    }
  }, [currentNode?.id]);

  useEffect(() => {
    // Also reset hints when moving to the next challenge in the same node
    setPreviousHints([]);
  }, [currentChallengeIndex]);

  if (loading || !user) return null;

  const showPipModal = (title, content) => {
    setPipMessage({ title, content });
    setIsModalOpen(true);
  };

  const handleVocabClick = async (word) => {
    showPipModal("Pip is thinking...", "Give me a moment to look that up!");
    try {
      const response = await api.post('/api/coach/explain', {
        question: `What does ${word} mean?`,
        context: currentNode.passage_text,
        wrong_answer: "",
        correct_answer: ""
      });
      showPipModal(`Meaning of "${word}"`, response.data.explanation);
    } catch (e) {
      showPipModal("Oops!", "Pip's magic is resting right now!");
    }
  };

  const handleHintRequest = async () => {
    if (!challenges[currentChallengeIndex]) return;
    showPipModal("Pip is thinking...", "Let me find a good hint for you!");
    try {
      const response = await api.post('/api/coach/hint', {
        question: challenges[currentChallengeIndex].question,
        context: currentNode.passage_text,
        previous_hints: previousHints
      });
      setPreviousHints([...previousHints, response.data.hint]);
      showPipModal("Pip's Hint", response.data.hint);
    } catch (e) {
      showPipModal("Hint", "Sorry for the inconvenience, my free API limit has been reached! Try looking back at the bold words in the text carefully.");
    }
  };

  const handleChallengeComplete = (correct) => {
    setLastChallengeCorrect(correct);
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      setAllChallengesComplete(true);
    }
  };

  const handleChoiceSelect = (choice) => {
    if (!currentNode || !activeSession) return;
    makeChoice(choice.id, lastChallengeCorrect, activeSession.difficulty.focus_skill);
  };

  return (
    <main 
      className="page-enter" 
      style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)', position: 'relative' }}
      onClick={() => {
        if (activeSession && currentNode && !allChallengesComplete) {
          recordClick();
        }
      }}
    >
      
      {/* Pip Custom Modal */}
      <AnimatePresence>
        {isModalOpen && pipMessage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--accent)',
                borderRadius: '24px',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <MessageCircleHeart size={40} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.75rem', margin: '0 0 1rem 0' }}>
                    {pipMessage.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6, margin: 0 }}>
                    {pipMessage.content}
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-pill" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pip Frustration Tooltip */}
      <AnimatePresence>
        {isFrustrated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '350px',
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              zIndex: 50
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <MessageCircleHeart size={24} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Pip says:</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                  This part is a little tricky! Take a deep breath. Try looking closely at the bold words in the passage.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem' }}
                onClick={() => {
                  handleHintRequest();
                  resetFrustration();
                }}
              >
                Get a Hint
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem', border: '1px solid var(--border)' }}
                onClick={() => {
                  showPipModal("Progress Saved", "Great job today! Take a break.");
                  setTimeout(() => router.push('/home'), 2000);
                }}
              >
                Take a Break
              </button>
            </div>
            
            <button 
              onClick={resetFrustration}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State 1: Start Session */}
      {!activeSession && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}
        >
          <div style={{ color: 'var(--accent)', marginBottom: 'var(--space-lg)' }}>
            <Sparkles size={64} strokeWidth={1.5} style={{ margin: '0 auto' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
            Ready for an adventure?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: 'var(--space-2xl)' }}>
            Your reading journey adapts to you. The better you read, the deeper the magic goes.
          </p>
          <button 
            className="btn btn-primary btn-pill btn-lg"
            onClick={() => startSession()}
          >
            <BookOpen size={20} /> Begin the Story
          </button>
        </motion.div>
      )}

      {/* State 2: Loading / Generating */}
      {(isLoading || isGenerating) && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--accent)' }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Wand2 size={48} />
          </motion.div>
          <p style={{ marginTop: 'var(--space-lg)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
            {isGenerating ? "Pip is weaving the next part of the story..." : "Lighting the lanterns..."}
          </p>
        </motion.div>
      )}

      {/* State 3: Active Gameplay */}
      {activeSession && currentNode && !isLoading && !isGenerating && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span>Chapter: {activeSession.theme}</span>
            <span>Progress: Passage {activeSession.progress}</span>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3xl)' }}>
            
            {/* Left Col: The Story */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <PassageDisplay 
                text={currentNode.passage_text} 
                vocabularyWords={currentNode.vocabulary_words} 
                onWordClick={handleVocabClick} 
              />
            </motion.div>
            
            {/* Right Col: The Game Loop */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              
              <AnimatePresence mode="wait">
                {!allChallengesComplete ? (
                  <motion.div 
                    key={`challenge-${currentChallengeIndex}`} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      <span>QUESTION {currentChallengeIndex + 1} OF {challenges.length}</span>
                    </div>
                    {challenges[currentChallengeIndex] && (
                      <ChallengeCard
                        question={challenges[currentChallengeIndex].question}
                        options={challenges[currentChallengeIndex].options}
                        correctAnswer={challenges[currentChallengeIndex].correct}
                        onHintRequest={handleHintRequest}
                        onComplete={() => handleChallengeComplete(true)}
                        onError={recordError}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="choices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stagger-children">
                    
                    {currentNode.branch_choices && currentNode.branch_choices.length > 0 ? (
                      <>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--success)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={20} /> Excellent! Now, what should happen next?
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                          {currentNode.branch_choices.map(choice => (
                            <StoryChoiceCard 
                              key={choice.id} 
                              choice={choice} 
                              onSelect={handleChoiceSelect} 
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'var(--success-soft)', border: '2px solid var(--success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                          <BookOpen size={48} color="var(--success)" />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--success)', fontSize: '2rem', margin: '0 0 1rem 0' }}>
                          The End!
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>
                          You completed the story! Your reading level has been updated and you earned +1 Session on your Adventure Map!
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button 
                            className="btn btn-pill btn-lg"
                            onClick={() => router.push('/home')}
                            style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--success)', color: 'var(--success)' }}
                          >
                            Return to Map
                          </button>
                          <button 
                            className="btn btn-primary btn-pill btn-lg"
                            onClick={() => {
                              // Re-start session
                              startSession();
                            }}
                            style={{ flex: 1, backgroundColor: 'var(--success)', border: '2px solid var(--success)' }}
                          >
                            Start New Story
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>
          </div>
        </div>
      )}
    </main>
  );
}
