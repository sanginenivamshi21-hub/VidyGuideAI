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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean; purpose?: string }>;
  register: (username: string, email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; userId?: number }>;
  verifyOtp: (email: string, code: string, purpose: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, purpose: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  refreshUser: () => Promise<void>;
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
    const init = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id !== null) {
            const resp = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
            const data = await resp.json();
            if (resp.ok && data.authenticated && data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              setUser(data.user);
            } else {
              const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST', credentials: 'include',
              });
              const refreshData = await refreshResp.json();
              if (refreshResp.ok && refreshData.user) {
                localStorage.setItem('user', JSON.stringify(refreshData.user));
                setUser(refreshData.user);
              } else {
                localStorage.removeItem('user');
                setUser(null);
              }
            }
          } else {
            setUser(parsed);
          }
        } catch { setUser(null); }
      }
      setLoading(false);
    };
    init();
  }, []);

  const isAuthenticated = user !== null && user.id !== null;
  const isGuest = user !== null && user.id === null;

  const refreshUser = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      const data = await resp.json();
      if (resp.ok && data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        } else { setUser(null); }
      }
    } catch {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else { setUser(null); }
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      const data = await resp.json();
      if (resp.ok && data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await resp.json();
      if (resp.ok && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      if (data.authenticated === false) {
        localStorage.removeItem('user');
        setUser(null);
      }
      return false;
    } catch {
      return false;
    }
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
          return { success: false, requiresOtp: true, purpose: data.purpose || 'login', error: data.message || 'OTP required' };
        }
        return { success: false, error: data.message || 'Invalid credentials' };
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error. Please check your connection.' };
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
      if (!resp.ok) return { success: false, error: data.message || 'Registration failed. Email or username might already exist.' };
      return { success: true, userId: data.userId };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error. Please check your connection.' };
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string, purpose: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.message || 'Invalid or expired OTP code.' };
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error. Please check your connection.' };
    }
  }, []);

  const resendOtp = useCallback(async (email: string, purpose: string, password?: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, purpose, ...(password ? { password } : {}) }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.message || 'Unable to resend verification code.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error. Please check your connection.' };
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
    <AuthContext.Provider value={{ user, isAuthenticated, isGuest, loading, login, register, verifyOtp, resendOtp, refreshSession, checkSession, logout, loginAsGuest, refreshUser }}>
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
