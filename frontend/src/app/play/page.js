"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Brain, Sparkles, MoveRight } from 'lucide-react';

export default function PlayHub() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)', backgroundColor: 'var(--bg-base)' }}>
      <div className="container-narrow stagger-children">
        
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-base)' }}>
            <Sparkles size={32} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, color: 'var(--text-primary)' }}>Play Hub</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>Choose your learning adventure</p>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          
          {/* Story Mode */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/play/story')}
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: '4px solid var(--accent)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <BookOpen size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Story Adventure</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Read dynamic stories and answer questions.</p>
              </div>
            </div>
            <MoveRight size={24} color="var(--text-muted)" />
          </motion.div>

          {/* Fluency Speedrun */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/play/fluency')}
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: '4px solid var(--warning)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <Mic size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Fluency Speedrun</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Read out loud and race the timer!</p>
              </div>
            </div>
            <MoveRight size={24} color="var(--text-muted)" />
          </motion.div>

          {/* Vocab Flashcards */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/play/vocab')}
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: '4px solid var(--success)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <Brain size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Vocab Flashcards</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Review words you learned in stories.</p>
              </div>
            </div>
            <MoveRight size={24} color="var(--text-muted)" />
          </motion.div>

        </div>
      </div>
    </main>
  );
}
