"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Map as MapIcon, Lock, Crown, Info } from 'lucide-react';
import api from '@/lib/api';

const MAP_NODES = [
  { id: 1, title: "The Whispering Woods", required_sessions: 0, x: 20, y: 10, color: "var(--success)" },
  { id: 2, title: "Crystal Caverns", required_sessions: 2, x: 70, y: 30, color: "var(--accent)" },
  { id: 3, title: "Starlight Peak", required_sessions: 5, x: 30, y: 55, color: "var(--warning)" },
  { id: 4, title: "The Floating Isles", required_sessions: 10, x: 80, y: 80, color: "var(--error)" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLexileTooltip, setShowLexileTooltip] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/coach/stats');
      setStats(response.data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) return null;

  const getHighestUnlockedIndex = () => {
    if (!stats) return 0;
    let highest = 0;
    MAP_NODES.forEach((node, idx) => {
      if (stats.sessions >= node.required_sessions) highest = idx;
    });
    return highest;
  };

  const highestUnlocked = getHighestUnlockedIndex();

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-base)' }}>
      
      {/* Background Decorative Gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, var(--accent-soft) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', margin: 0, color: 'var(--text-primary)' }}>
              {stats ? `Welcome, ${stats.name}!` : 'Welcome!'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', margin: '0.5rem 0 0 0' }}>
              Your Adventure Map awaits.
            </p>
          </div>
          
          {stats && (
            <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div 
                style={{ textAlign: 'center', position: 'relative', cursor: 'help' }}
                onMouseEnter={() => setShowLexileTooltip(true)}
                onMouseLeave={() => setShowLexileTooltip(false)}
              >
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  Level <Info size={14} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--accent)' }}>{stats.lexile}L</div>
                
                {showLexileTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      marginTop: '0.5rem',
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      width: '280px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      zIndex: 50,
                      textAlign: 'left'
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="var(--accent)" /> Lexile® Measure
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      A standard scale used to match readers with texts of appropriate difficulty.
                    </p>
                    <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: 600 }}>Grade</th>
                          <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Lexile Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>1st Grade</td><td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>190L - 530L</td></tr>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>2nd Grade</td><td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>420L - 650L</td></tr>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>3rd Grade</td><td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>520L - 820L</td></tr>
                        <tr><td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>4th Grade</td><td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>740L - 940L</td></tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>
              <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quests</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--warning)' }}>{stats.sessions}</div>
              </div>
            </div>
          )}
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Sparkles size={32} color="var(--accent)" />
            </motion.div>
          </div>
        ) : (
          <div style={{ position: 'relative', height: '600px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* SVG Path connecting nodes */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
              {MAP_NODES.map((node, i) => {
                if (i === MAP_NODES.length - 1) return null;
                const nextNode = MAP_NODES[i + 1];
                const isUnlocked = i < highestUnlocked;
                
                return (
                  <motion.line
                    key={`line-${node.id}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${nextNode.x}%`}
                    y2={`${nextNode.y}%`}
                    stroke={isUnlocked ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth="6"
                    strokeDasharray={isUnlocked ? "0" : "10,10"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: i * 0.5 }}
                  />
                );
              })}
            </svg>

            {/* Map Nodes */}
            {MAP_NODES.map((node, idx) => {
              const isUnlocked = stats.sessions >= node.required_sessions;
              const isCurrent = idx === highestUnlocked;
              
              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <motion.button
                    whileHover={isUnlocked ? { scale: 1.1 } : {}}
                    whileTap={isUnlocked ? { scale: 0.9 } : {}}
                    onClick={() => isUnlocked && router.push('/play')}
                    style={{
                      width: isCurrent ? '80px' : '64px',
                      height: isCurrent ? '80px' : '64px',
                      borderRadius: '50%',
                      backgroundColor: isUnlocked ? node.color : 'var(--bg-base)',
                      border: `4px solid ${isUnlocked ? 'var(--bg-card)' : 'var(--border)'}`,
                      boxShadow: isUnlocked ? `0 0 20px ${node.color}40` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUnlocked ? '#fff' : 'var(--text-muted)',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCurrent ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Play size={32} fill="currentColor" />
                      </motion.div>
                    ) : isUnlocked ? (
                      <Crown size={24} />
                    ) : (
                      <Lock size={24} />
                    )}
                  </motion.button>
                  
                  <div style={{ 
                    backgroundColor: 'var(--bg-card)', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    {node.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
