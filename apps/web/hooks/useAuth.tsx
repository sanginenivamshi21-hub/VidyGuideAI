'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export interface User {
  id: number | null;
  username: string;
  fullName: string;
  email: string;
  isVerified?: boolean;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean }>;
  register: (username: string, email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch { setUser(null); }
    }
    setLoading(false);
  }, []);

  const isAuthenticated = user !== null && user.id !== null;
  const isGuest = user !== null && user.id === null;

  const refreshUser = useCallback(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    } else { setUser(null); }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (data.requiresOtp || (data.message && data.message.includes('OTP'))) {
          return { success: false, requiresOtp: true, error: data.message || 'OTP required' };
        }
        return { success: false, error: data.message || 'Invalid credentials' };
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, fullName: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, fullName }),
      });
      const data = await resp.json();
      if (!resp.ok) return { success: false, error: data.message || 'Registration failed' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
      id: null,
      username: 'Guest',
      fullName: 'Guest Candidate',
      email: '',
      isVerified: true,
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isGuest, loading, login, register, logout, loginAsGuest, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useRequireAuth() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !isGuest) {
      router.push(ROUTES.AUTH);
    }
  }, [loading, isAuthenticated, isGuest, router]);

  return { isAuthenticated, isGuest, loading };
}

export function useRequireRegistered() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(ROUTES.AUTH);
    }
  }, [loading, isAuthenticated, router]);

  return { isAuthenticated, loading };
}
