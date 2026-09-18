"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // 'dark' or 'storybook'
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(0.9);
  const [fontSize, setFontSize] = useState('normal'); // 'normal', 'large', 'xl'

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('litverse-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.dyslexiaMode !== undefined) setDyslexiaMode(parsed.dyslexiaMode);
        if (parsed.ttsSpeed) setTtsSpeed(parsed.ttsSpeed);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  // Persist to localStorage and apply theme to <html>
  useEffect(() => {
    localStorage.setItem('litverse-settings', JSON.stringify({ theme, dyslexiaMode, ttsSpeed, fontSize }));

    // Apply theme via data attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Apply dyslexia mode
    if (dyslexiaMode) {
      document.documentElement.classList.add('dyslexia-mode');
    } else {
      document.documentElement.classList.remove('dyslexia-mode');
    }
  }, [theme, dyslexiaMode, ttsSpeed, fontSize]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'storybook' : 'dark');
  };

  return (
    <SettingsContext.Provider value={{
      theme, setTheme, toggleTheme,
      dyslexiaMode, setDyslexiaMode,
      ttsSpeed, setTtsSpeed,
      fontSize, setFontSize
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
