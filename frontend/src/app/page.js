"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loginWithGoogle, bypassLogin } = useAuth();
  const router = useRouter();

  // If the user is already logged in, push them to the onboarding screen
  useEffect(() => {
    if (user) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const handleLoginSuccess = async (credentialResponse) => {
    const success = await loginWithGoogle(credentialResponse);
    if (success) {
      router.push('/onboarding');
    }
  };

  const handleLoginError = () => {
    console.error('Google Login Failed');
  };

  const handleBypass = () => {
    if (bypassLogin()) {
      router.push('/onboarding');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fbbf24' }}>ReadQuest AI</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Step into the Lantern Isles and learn to read by playing the story. Every word you read brings the world to life.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            shape="pill"
            theme="filled_blue"
            size="large"
            text="continue_with"
          />
          <button 
            onClick={handleBypass}
            style={{ padding: '10px 24px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '9999px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}
          >
            Bypass Login (Dev Mode)
          </button>
        </div>
      </div>
    </main>
  );
}
