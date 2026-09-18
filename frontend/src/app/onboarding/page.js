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
    return <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }} />;
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
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Before you step into the Lantern Isles, here is how LitVerse works.
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
            style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', borderTop: '4px solid var(--accent)', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/home')}
        style={{
          padding: '1rem 3rem',
          backgroundColor: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '9999px',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px var(--accent-soft)'
        }}
      >
        Start the Adventure
      </motion.button>
    </main>
  );
}
