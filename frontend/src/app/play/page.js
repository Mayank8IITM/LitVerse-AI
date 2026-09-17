"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PassageDisplay from '@/components/reading/PassageDisplay';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ReadAloudChallenge from '@/components/challenges/ReadAloudChallenge';
import api from '@/lib/api';

export default function Play() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [challengeType, setChallengeType] = useState('mcq'); // 'mcq' or 'read-aloud'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading magic...</div>;
  }

  if (!user) return null;

  const samplePassage = "The ancient lantern flickered in the misty woods of Echora. Pip, a small creature with glowing ears, hesitated at the edge of the shadow. 'We must find the lost crystal,' Pip whispered, pointing toward a crumbling stone bridge that looked remarkably perilous.";
  const sampleVocab = ["ancient", "flickered", "hesitated", "perilous"];

  const handleVocabClick = async (word) => {
    try {
      const response = await api.post('/api/coach/explain', {
        question: `What does ${word} mean?`,
        context: samplePassage,
        wrong_answer: "",
        correct_answer: ""
      });
      alert(`AI Coach: ${response.data.explanation}`);
    } catch (e) {
      alert("AI Coach (Pip): Oops, my magic is resting right now!");
    }
  };

  const handleHintRequest = async () => {
    try {
      const response = await api.post('/api/coach/hint', {
        question: "Why was the bridge considered perilous?",
        context: samplePassage,
        previous_hints: []
      });
      alert(`AI Coach: ${response.data.hint}`);
    } catch (e) {
      alert("AI Coach (Pip): Think about what bridges are usually made of and what 'crumbling' might mean!");
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', maxWidth: '1000px', margin: '0 auto 4rem auto' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏮</span> Lantern Isles
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: '500' }}
          >
            Parent Dashboard
          </button>
          <button 
            onClick={logout}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            Sign Out
          </button>
        </div>
      </header>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
        <div>
          <PassageDisplay 
            text={samplePassage} 
            vocabularyWords={sampleVocab} 
            onWordClick={handleVocabClick} 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#1e293b', padding: '0.5rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setChallengeType('mcq')}
              style={{ padding: '0.5rem 1rem', background: challengeType === 'mcq' ? '#3b82f6' : 'transparent', color: challengeType === 'mcq' ? 'white' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Comprehension
            </button>
            <button 
              onClick={() => setChallengeType('read-aloud')}
              style={{ padding: '0.5rem 1rem', background: challengeType === 'read-aloud' ? '#10b981' : 'transparent', color: challengeType === 'read-aloud' ? 'white' : '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Read Aloud
            </button>
          </div>

          {challengeType === 'mcq' ? (
            <ChallengeCard
              question="Why was the bridge considered perilous?"
              options={[
                "It was too narrow for Pip to cross.",
                "It was crumbling and made of stone.",
                "There was a troll sleeping under it.",
                "It was covered in slippery moss."
              ]}
              correctAnswer="It was crumbling and made of stone."
              onHintRequest={handleHintRequest}
              onComplete={() => alert("Challenge Completed! The lantern glows brighter.")}
            />
          ) : (
            <ReadAloudChallenge
              textToRead="Pip hesitated at the edge of the shadow."
              onComplete={() => alert("Perfect reading! You earned a Star!")}
            />
          )}
        </div>
      </div>
    </main>
  );
}
