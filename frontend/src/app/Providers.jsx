"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';

export default function Providers({ children }) {
  // In production, this should be set in .env.local
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
