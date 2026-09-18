"use client";

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Home, Play, LayoutDashboard, Settings, Sun, Moon, LogOut, BookOpen, Brain } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't show navbar on login page
  if (!user || pathname === '/') return null;

  const navItems = [
    { label: 'Home', path: '/home', icon: <Home size={18} /> },
    { label: 'Play', path: '/play', icon: <Play size={18} /> },
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: theme === 'dark' 
        ? 'rgba(15, 23, 42, 0.85)' 
        : 'rgba(254, 247, 237, 0.85)',
      borderBottom: '1px solid var(--border)',
      transition: 'background-color var(--transition-base)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/home')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-sm)', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div className="animate-lantern" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--accent)',
            letterSpacing: '-0.02em'
          }}>
            LitVerse
          </span>
        </motion.div>

        {/* Nav Links (Desktop) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
        }}>
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: isActive(item.path) ? 600 : 500,
                backgroundColor: isActive(item.path) ? 'var(--accent-soft)' : 'transparent',
                color: isActive(item.path) ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Storybook mode' : 'Switch to Dark mode'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* User Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--accent)',
              background: 'var(--accent-soft)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--accent)',
              fontFamily: 'var(--font-display)',
              position: 'relative',
            }}
          >
            {user.name ? user.name[0].toUpperCase() : '?'}
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '60px',
                  right: 'var(--space-xl)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm)',
                  minWidth: '200px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                }}
              >
                <div style={{ 
                  padding: 'var(--space-sm) var(--space-md)', 
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                </div>

                <button 
                  onClick={() => { setMenuOpen(false); router.push('/settings'); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: 'var(--space-sm) var(--space-md)',
                    background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem',
                    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--accent-soft)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <Settings size={16} /> Settings
                </button>

                <button 
                  onClick={() => { setMenuOpen(false); logout(); router.push('/'); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: 'var(--space-sm) var(--space-md)',
                    background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem',
                    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
