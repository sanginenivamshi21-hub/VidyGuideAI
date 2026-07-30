'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Lock, Mail, User as UserIcon, ShieldAlert, Send } from 'lucide-react';
import { API_BASE, api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, register, verifyOtp, resendOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'reset'>('login');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('register');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'register') setMode('register');
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) router.push(ROUTES.DASHBOARD);
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      if (result.requiresOtp) {
        setOtpPurpose(result.purpose || 'login');
        setMode('otp');
        setMessage('Please check your email and enter the verification code to complete sign in.');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await register(username, email, password, fullName);
    if (result.success) {
      setOtpPurpose('register');
      setMode('otp');
      setMessage('Account created! A 6-digit verification code has been sent to your email. Please check your inbox (and spam folder).');
    } else {
      setError(result.error || 'Registration failed. Email or username might already exist.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await verifyOtp(email, otpCode, otpPurpose);
    if (!result.success) {
      setError(result.error || 'Verification failed. Check your code and try again.');
    } else {
      setMessage('Verification successful! Redirecting to dashboard...');
      setTimeout(() => router.push(ROUTES.DASHBOARD), 500);
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setResending(true);

    const passwordForResend = otpPurpose === 'login' || otpPurpose === 'register' ? password : undefined;
    const result = await resendOtp(email, otpPurpose, passwordForResend);

    if (!result.success) {
      setError(result.error || 'Unable to resend verification code.');
    } else {
      setMessage('A new verification code has been sent to your email.');
    }
    setResending(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });

      setMessage('If an account exists, a 6-digit verification code has been sent to your email.');
      setMode('reset');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Unable to process request. Please try again.');
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
      await api('/auth/reset-password', {
        method: 'POST',
        body: { email, code: otpCode, password },
      });

      setMessage('Password reset successful! You can now sign in with your new password.');
      setMode('login');
      setPassword('');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Unable to reset password. Make sure the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guestUser = { id: null, username: 'Guest', fullName: 'Guest Candidate', email: '', isVerified: true };
    localStorage.setItem('user', JSON.stringify(guestUser));
    router.push(ROUTES.CAREER);
  };

  const changeMode = (newMode: typeof mode) => {
    setError('');
    setMessage('');
    setMode(newMode);
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

        {/* LOGIN */}
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
                  onClick={() => changeMode('forgot')}
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
                  onClick={() => changeMode('register')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Create account
                </button>
              </span>
            </div>
          </form>
        )}

        {/* REGISTER */}
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
              <span>{loading ? 'Sending verification code...' : 'Register & Send OTP'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('login')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            </div>
          </form>
        )}

        {/* OTP */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Enter 6-Digit Verification Code
              </label>
              <p className="text-[10px] text-slate-500 text-center">
                Sent to <span className="text-slate-300 font-semibold">{email}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(val);
                  if (val.length === 6) {
                    setTimeout(() => {
                      const form = e.target.closest('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }
                }}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm text-center tracking-[0.5em] font-mono font-bold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Verifying code...' : 'Verify Code'}</span>
            </button>

            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold disabled:text-slate-600 disabled:pointer-events-none"
              >
                {resending ? (
                  <><RefreshCw size={12} className="animate-spin" /> Resending...</>
                ) : (
                  <><Send size={12} /> Resend verification code</>
                )}
              </button>
              <p className="text-[10px] text-slate-500">Code expires in 10 minutes</p>
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="text-xs text-slate-400 hover:text-white font-semibold"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
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
              <span>{loading ? 'Sending reset code...' : 'Request Password Reset'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('login')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </span>
            </div>
          </form>
        )}

        {/* RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center font-mono">
                Enter Password Reset Code
              </label>
              <p className="text-[10px] text-slate-500 text-center">
                Sent to <span className="text-slate-300 font-semibold">{email}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(val);
                  if (val.length === 6) {
                    setTimeout(() => {
                      const form = e.target.closest('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }
                }}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm text-center tracking-[0.5em] font-mono font-bold transition-all"
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
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="animate-spin" size={14} />}
              <span>{loading ? 'Resetting password...' : 'Verify & Reset Password'}</span>
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => changeMode('login')}
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
