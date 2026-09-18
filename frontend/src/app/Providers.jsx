"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { GameProvider } from '@/context/GameContext';
import Navbar from '@/components/layout/Navbar';

export default function Providers({ children }) {
  // In production, this should be set in .env.local
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SettingsProvider>
          <GameProvider>
            <Navbar />
            {children}
          </GameProvider>
        </SettingsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
