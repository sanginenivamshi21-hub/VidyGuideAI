'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Lock, Mail, User as UserIcon, ShieldAlert } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { API_BASE } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'reset'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('register');
  
  // Feedback states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

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
          setOtpPurpose(data.purpose || 'login');
          setMode('otp');
          setMessage(data.message || 'Please complete your OTP verification to log in.');
        } else {
          throw new Error(data.message || 'Invalid credentials or login failed.');
        }
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err: any) {
      setError(err.message || '🚫 Something went wrong. We couldn\'t process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, fullName }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Registration failed.');
      } else {
        setOtpPurpose('register');
        setMode('otp');
        setMessage('Registration successful! A 6-digit OTP code has been dispatched to your email.');
      }
    } catch (err: any) {
      setError(err.message || '🚫 Registration failed. Email or username might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpCode, purpose: otpPurpose }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Invalid or expired OTP code.');
      } else {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setMessage(data.message || 'Verification successful!');
        setMode('login');
        setPassword('');
        setOtpCode('');
        if (data.user) {
          router.push(ROUTES.DASHBOARD);
        }
      }
    } catch (err: any) {
      setError(err.message || '🚫 Verification failed. Check your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Forgot password request failed.');
      }

      setMessage('If your account exists, a 6-digit OTP has been sent to your email.');
      setMode('reset');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || '🚫 Something went wrong. We couldn\'t process your request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpCode, password }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Reset password verification failed.');
      }

      setMessage('Password reset successful! You can now sign in with your new password.');
      setMode('login');
      setPassword('');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || '🚫 Reset password failed. Make sure the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guestUser = {
      id: null,
      username: 'Guest',
      fullName: 'Guest Candidate',
      email: '',
      isVerified: true
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    router.push(ROUTES.CAREER);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 backdrop-blur-md">
        <div className="text-center flex flex-col gap-2">
          <span className="text-4xl">🌿</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">VidyGuideAI</h2>
          <p className="text-slate-400 text-xs">
            Localized AI Career Counseling for Indian Students
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl font-semibold flex items-center gap-2 animate-fadeIn">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold text-center animate-fadeIn">
            {message}
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('forgot');
                  }}
                  className="text-[10px] font-semibold text-emerald-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                New to VidyGuideAI?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('register');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Create account
                </button>
              </span>
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ravi Kumar"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <UserIcon size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ravikumar_12"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password (Min. 6 chars)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Registering...' : 'Register & Send OTP'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('login');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            </div>
          </form>
        )}

        {/* OTP VERIFICATION MODE */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm text-center tracking-widest font-mono font-bold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Verifying OTP...' : 'Verify OTP'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Wrong email or need to go back?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('login');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </span>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD REQUEST MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Sending OTP...' : 'Request Password Reset'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('login');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </span>
            </div>
          </form>
        )}

        {/* RESET PASSWORD CONFIRM MODE */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center font-mono">Enter 6-Digit Password Reset OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm text-center tracking-widest font-mono font-bold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password (Min. 6 chars)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 pl-10 outline-none text-sm transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Resetting Password...' : 'Verify & Reset Password'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Cancel and go back?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMessage('');
                    setMode('login');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </span>
            </div>
          </form>
        )}

        <div className="flex items-center gap-4 my-1">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          onClick={handleGuest}
          className="w-full py-3 border border-slate-800 hover:border-slate-700 bg-slate-950/80 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
        >
          👤 Continue as Guest
        </button>
        <div className="text-[10px] text-slate-500 text-center leading-relaxed font-semibold">
          History and dashboards are disabled in guest mode.
        </div>
      </div>
    </div>
  );
}
