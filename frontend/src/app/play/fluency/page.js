"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, RotateCcw, Award, Flame, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '@/lib/api';

const LONG_PARAGRAPH = 
  "The brave little fox leaped over the sparkling stream. She was looking for her lost treasure. Deep in the forest, the trees whispered secrets to the wind. Suddenly, she saw a shiny golden coin resting on a green leaf. Pip the owl loved to read books under the moonlight. Every night, he would fly to the highest branch of the oldest oak tree. With his reading glasses on, he traveled to magical worlds without ever leaving the forest. The spaceship zoomed past a purple planet with three moons. Captain Nova steered carefully through the asteroid field. Her crew cheered as they finally saw Earth in the distance, a beautiful blue marble in the dark sky. Down by the rushing river, a tiny green frog sang a loud song. He hoped his friends would hear him and come play in the cool mud. When it started to rain, the frog just smiled, because rainy days were his absolute favorite time to splash and jump. Meanwhile, a tired dragon slept in a dark cave, dreaming of eating spicy tacos and flying over volcanoes.";

export default function FluencyGame() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [words, setWords] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matchedIndices, setMatchedIndices] = useState(new Set());
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);
  
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/');
    const w = LONG_PARAGRAPH.split(/\s+/).map(word => ({
      original: word,
      clean: word.replace(/[.,!?]/g, '').toLowerCase()
    }));
    setWords(w);
  }, [user, loading, router]);

  // Setup Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setTranscript(currentTranscript.toLowerCase());
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed' || event.error === 'network') {
            stopRecording();
          }
        };
      }
    }
  }, []);

  // Strict left-to-right matching logic
  useEffect(() => {
    if (!isRecording) return;

    const spokenWords = transcript.split(/\s+/).filter(w => w.length > 0);
    const newMatched = new Set();
    
    let targetIndex = 0; // Where we are in the paragraph
    let currentCombo = 0;

    for (let i = 0; i < spokenWords.length; i++) {
      const spoken = spokenWords[i];
      
      // Look ahead slightly (fuzzy matching window of 3 words)
      // This allows the child to skip a word and keep going without breaking the whole game
      let matched = false;
      for (let lookahead = 0; lookahead < 3; lookahead++) {
        if (targetIndex + lookahead < words.length) {
          const target = words[targetIndex + lookahead].clean;
          
          // Exact match or very close fuzzy match (e.g. jumped vs jump)
          if (target === spoken || target.includes(spoken) || spoken.includes(target)) {
            newMatched.add(targetIndex + lookahead);
            targetIndex = targetIndex + lookahead + 1;
            matched = true;
            currentCombo++;
            break;
          }
        }
      }
      
      if (!matched) {
        // Reset combo if they said something completely wrong and didn't recover
        currentCombo = 0;
      }
    }

    setMatchedIndices(newMatched);
    setCurrentActiveIndex(targetIndex < words.length ? targetIndex : words.length - 1);
    
    if (currentCombo > maxCombo) setMaxCombo(currentCombo);
    setCombo(currentCombo);

    // If all words are matched, finish game early
    if (newMatched.size === words.length && words.length > 0) {
      finishGame(newMatched.size, 60 - timeLeft, transcript);
    }
  }, [transcript, isRecording, words, timeLeft, maxCombo]);

  // Auto-scroll to active word
  useEffect(() => {
    if (isRecording && containerRef.current) {
      const activeEl = containerRef.current.querySelector('.active-word');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentActiveIndex, isRecording]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Handle game over when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && isRecording) {
      finishGame(matchedIndices.size, 60, transcript);
    }
  }, [timeLeft, isRecording, matchedIndices.size, transcript]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support Speech Recognition. Please try Google Chrome.");
      return;
    }
    setMatchedIndices(new Set());
    setTranscript("");
    setTimeLeft(60);
    setCombo(0);
    setMaxCombo(0);
    setCurrentActiveIndex(0);
    setIsFinished(false);
    setAiFeedback(null);
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const fetchAiFeedback = async (finalTranscript) => {
    setIsFetchingFeedback(true);
    try {
      const response = await api.post('/api/coach/fluency-feedback', {
        target_text: LONG_PARAGRAPH,
        transcript: finalTranscript || "They didn't say anything clearly."
      });
      setAiFeedback(response.data.feedback);
    } catch (e) {
      setAiFeedback("Pip was too amazed by your speed to write a report! Great job!");
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  const finishGame = (wordsCorrect, timeTakenSeconds, finalTranscript) => {
    stopRecording();
    setIsFinished(true);
    
    // Calculate Words Per Minute (WCPM)
    const timeInMinutes = timeTakenSeconds / 60;
    const wcpm = timeInMinutes > 0 ? Math.round(wordsCorrect / timeInMinutes) : wordsCorrect;
    setScore(wcpm);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    
    fetchAiFeedback(finalTranscript);
  };

  if (loading || !user) return null;

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, color: 'var(--text-primary)' }}>Fluency Speedrun</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>Read out loud. The faster and more accurate, the better!</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <AnimatePresence>
              {combo > 4 && (
                <motion.div 
                  initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                  className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }}
                >
                  <Flame size={24} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{combo}x COMBO</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: isRecording && timeLeft <= 10 ? 'var(--error-soft)' : 'var(--bg-card)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Time left:</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: isRecording && timeLeft <= 10 ? 'var(--error)' : 'var(--text-primary)' }}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </header>

        {!isFinished ? (
          <div className="card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* The Text */}
            <div ref={containerRef} style={{ fontSize: '2rem', lineHeight: 2, fontFamily: 'var(--font-outfit)', color: 'var(--text-secondary)', maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem', scrollBehavior: 'smooth' }}>
              {words.map((wordObj, idx) => {
                const isMatched = matchedIndices.has(idx);
                const isActive = idx === currentActiveIndex;
                
                return (
                  <span 
                    key={idx} 
                    className={isActive ? "active-word" : ""}
                    style={{ 
                      display: 'inline-block',
                      marginRight: '0.75rem',
                      color: isMatched ? 'var(--success)' : (isActive ? 'var(--accent)' : 'inherit'),
                      fontWeight: (isMatched || isActive) ? '600' : '400',
                      transition: 'all 0.2s ease',
                      borderBottom: isMatched ? '3px solid var(--success)' : (isActive ? '3px solid var(--accent)' : '3px solid transparent'),
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      textShadow: isActive ? '0 0 10px var(--accent-soft)' : 'none'
                    }}
                  >
                    {wordObj.original}
                  </span>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
              {!isRecording ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="btn btn-lg"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '999px', padding: '1rem 3rem', fontSize: '1.25rem' }}
                >
                  <Mic size={24} style={{ marginRight: '0.5rem' }} /> Start Reading
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => finishGame(matchedIndices.size, 60 - timeLeft, transcript)}
                  className="btn btn-lg"
                  style={{ backgroundColor: 'var(--error)', color: '#fff', borderRadius: '999px', padding: '1rem 3rem', fontSize: '1.25rem' }}
                >
                  <Square size={24} style={{ marginRight: '0.5rem' }} /> Stop
                </motion.button>
              )}
            </div>
            
          </div>
        ) : (
          /* Results Screen */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card stagger-children" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <Award size={48} />
              </div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Fantastic Reading!</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '3rem 0' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Words Correct</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--success)' }}>{matchedIndices.size}</div>
              </div>
              <div style={{ width: '2px', backgroundColor: 'var(--border)' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Speed (WCPM)</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--accent)' }}>{score}</div>
              </div>
              <div style={{ width: '2px', backgroundColor: 'var(--border)' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Best Combo</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--warning)' }}>{maxCombo}</div>
              </div>
            </div>

            {/* AI Feedback Box */}
            <div style={{ backgroundColor: 'var(--bg-base)', border: '2px solid var(--accent-soft)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem', textAlign: 'left' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', margin: '0 0 1rem 0' }}>
                <Wand2 size={24} /> Pip's Pronunciation Feedback
              </h3>
              {isFetchingFeedback ? (
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Wand2 size={16} />
                  </motion.div>
                  Pip is analyzing your voice...
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6, margin: 0 }}>
                  {aiFeedback}
                </p>
              )}
            </div>

            <button onClick={() => {
              setMatchedIndices(new Set());
              setTranscript("");
              setTimeLeft(60);
              setIsFinished(false);
            }} className="btn btn-primary btn-pill btn-lg">
              <RotateCcw size={20} style={{ marginRight: '0.5rem' }} /> Read Another
            </button>
          </motion.div>
        )}

      </div>
    </main>
  );
}
