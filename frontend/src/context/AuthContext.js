"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user state from cookies on mount
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      // In a full implementation, you'd want a /api/user/me endpoint to fetch full user details.
      // For now, we decode basic info from cookies if we stored it, or just set logged-in state.
      const userId = Cookies.get('user_id');
      const userEmail = Cookies.get('user_email');
      const userName = Cookies.get('user_name');
      
      if (userId) {
        setUser({ id: userId, email: userEmail, name: userName });
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (credentialResponse) => {
    try {
      // credentialResponse contains the Google JWT id_token
      const response = await api.post('/api/auth/google', {
        token: credentialResponse.credential,
      });

      const data = response.data;
      
      // Store JWT in cookie (expires in 7 days)
      Cookies.set('token', data.access_token, { expires: 7 });
      Cookies.set('user_id', data.user_id, { expires: 7 });
      Cookies.set('user_email', data.email, { expires: 7 });
      Cookies.set('user_name', data.name, { expires: 7 });

      setUser({
        id: data.user_id,
        email: data.email,
        name: data.name,
      });

      return true;
    } catch (error) {
      console.error("Google authentication failed", error);
      return false;
    }
  };

  const bypassLogin = () => {
    Cookies.set('token', 'dev-bypass-token', { expires: 7 });
    Cookies.set('user_id', 'dev-user-id', { expires: 7 });
    Cookies.set('user_email', 'dev@example.com', { expires: 7 });
    Cookies.set('user_name', 'Dev User', { expires: 7 });
    setUser({
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Dev User',
    });
    return true;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user_id');
    Cookies.remove('user_email');
    Cookies.remove('user_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, bypassLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
