'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShieldAlert, Sparkles, RefreshCw, Award, BookOpen, MessageSquare, Save } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async () => {
    setError('');
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/users/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (resp.status === 401) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to retrieve profile data.');
      }

      setProfile(data.user);
      setStats(data.stats);
      setFullName(data.user.fullName || '');
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.id === null) {
      setIsGuest(true);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const resp = await fetch('http://localhost:8000/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          ...(password ? { password } : {}),
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      // Update local storage user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.fullName = data.user.fullName;
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto gap-4 min-h-[50vh]">
        <div className="p-3.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-full text-2xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white">Profile is Disabled</h2>
        <p className="text-xs text-slate-405 leading-relaxed">
          You are currently signed in as a Guest. Profile settings and user stats dashboards are only available for registered student accounts.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/auth');
          }}
          className="mt-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xl">
          👤
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Candidate Profile</h1>
          <p className="text-slate-500 text-xs">
            Manage your personal data, password authentication, and track your activity logs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs font-semibold text-slate-500 text-center py-12">
          Loading profile parameters...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats blocks column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Stats</h3>
            
            <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-lg">🌱</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Roadmaps</span>
                <span className="text-lg font-extrabold text-white mt-1">{stats?.career_count || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-lg">📝</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Resumes</span>
                <span className="text-lg font-extrabold text-white mt-1">{stats?.resume_count || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-lg">🤖</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Chats</span>
                <span className="text-lg font-extrabold text-white mt-1">{stats?.mentor_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Edit details form column */}
          <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3">
              Edit Account Parameters
            </h3>

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

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (readonly)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full bg-slate-950/60 border border-slate-900 text-slate-500 rounded-lg p-2.5 text-xs select-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username (readonly)</label>
                <input
                  type="text"
                  disabled
                  value={profile?.username || ''}
                  className="w-full bg-slate-950/60 border border-slate-900 text-slate-500 rounded-lg p-2.5 text-xs select-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ravi Kumar"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/25 active:scale-95 transition-all mt-4 flex items-center justify-center gap-1.5 w-fit"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Profile Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
