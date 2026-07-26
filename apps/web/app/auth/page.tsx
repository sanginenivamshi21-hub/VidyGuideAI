'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('register');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (data.message && data.message.includes('complete OTP')) {
          setOtpPurpose('register');
          setMode('otp');
          setMessage('Please verify your registration OTP.');
        } else {
          throw new Error(data.message || 'Login failed.');
        }
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Check backend server.');
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
      const resp = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Registration failed.');
      } else {
        setOtpPurpose('register');
        setMode('otp');
        setMessage('Registration successful! Check your email for the 6-digit OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
      const resp = await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, purpose: otpPurpose }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      } else {
        setMessage('Verification successful! You can now log in.');
        setMode('login');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
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
    router.push('/career');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <span className="text-4xl">🌿</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">VidyGuideAI</h2>
          <p className="text-slate-400 text-sm">
            Localized AI Career Counseling for Indian Students
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-medium text-center">
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                New to VidyGuideAI?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Create account
                </button>
              </span>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ravi Kumar"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ravikumar_12"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password (Min. 6 chars)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
            >
              {loading ? 'Registering...' : 'Register & Get OTP'}
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            </div>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm text-center tracking-widest font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">
                Wrong email or need to go back?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </span>
            </div>
          </form>
        )}

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          onClick={handleGuest}
          className="w-full py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-350 hover:text-white text-sm font-semibold rounded-lg transition-all"
        >
          👤 Continue as Guest
        </button>
        <div className="text-[10px] text-slate-500 text-center leading-relaxed">
          History and dashboards are disabled in guest mode.
        </div>
      </div>
    </div>
  );
}
