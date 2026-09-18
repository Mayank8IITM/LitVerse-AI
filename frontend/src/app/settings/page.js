"use client";

import { useSettings } from '@/context/SettingsContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { 
    theme, toggleTheme, 
    dyslexiaMode, setDyslexiaMode, 
    ttsSpeed, setTtsSpeed 
  } = useSettings();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)' }}>
      <div className="container-narrow">
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2.5rem', 
          marginBottom: 'var(--space-xl)' 
        }}>
          Settings
        </h1>

        <div className="card stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          
          {/* Theme Setting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Appearance Theme</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Switch between dark mode and storybook mode</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {theme === 'dark' ? <><Sun size={16} /> Storybook Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
          </div>

          {/* Dyslexia Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Dyslexia-Friendly Mode</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Uses specialized font and spacing for easier reading</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
              <input 
                type="checkbox" 
                checked={dyslexiaMode} 
                onChange={(e) => setDyslexiaMode(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: dyslexiaMode ? 'var(--accent)' : 'var(--border)',
                transition: '0.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '26px', width: '26px', 
                  left: dyslexiaMode ? '29px' : '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '0.4s', borderRadius: '50%'
                }}/>
              </span>
            </label>
          </div>

          {/* TTS Speed */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Reading Speed</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>How fast Pip reads the stories out loud</p>
            </div>
            <select 
              value={ttsSpeed}
              onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value={0.7}>Slow (0.7x)</option>
              <option value={0.9}>Normal (0.9x)</option>
              <option value={1.2}>Fast (1.2x)</option>
            </select>
          </div>

        </div>
      </div>
    </main>
  );
}
