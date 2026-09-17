"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div style={{ backgroundColor: '#0f172a', minHeight: '100vh' }} />;
  }

  const features = [
    {
      title: "Interactive Storytelling",
      description: "Read passages that adapt to your level. Your reading changes the world.",
      icon: "📖"
    },
    {
      title: "AI Reading Coach",
      description: "Meet Pip, your personal guide who helps you understand difficult words and sentences without just giving the answer.",
      icon: "🦊"
    },
    {
      title: "Real-time Feedback",
      description: "Earn rewards, collect magical creatures, and build your confidence step-by-step.",
      icon: "✨"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}
      >
        <h1 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '3.5rem', color: '#fbbf24', marginBottom: '1rem' }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '1.25rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          Before you step into the Lantern Isles, here is how the magic works.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', width: '100%', marginBottom: '5rem' }}
      >
        {features.map((feature, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', borderTop: '4px solid #fbbf24', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }}>{feature.title}</h3>
            <p style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#94a3b8', lineHeight: '1.5' }}>{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        whileHover={{ scale: 1.05, backgroundColor: '#f59e0b' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/play')}
        style={{
          padding: '1rem 3rem',
          backgroundColor: '#fbbf24',
          color: '#0f172a',
          border: 'none',
          borderRadius: '9999px',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), sans-serif',
          boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.4)'
        }}
      >
        Start the Adventure
      </motion.button>
    </main>
  );
}
