'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RefreshCw, Save, User, Map as MapIcon, FileText, Bot, Lock, ShieldCheck } from 'lucide-react';
import { api, fetchWithAuth } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useAuth, useRequireRegistered } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

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

const STAT_ITEMS = [
  { key: 'career_count' as const, icon: MapIcon, tint: 'var(--accent-10)', color: 'var(--accent)', i18nLabel: 'dashboard.statsRoadmaps' },
  { key: 'resume_count' as const, icon: FileText, tint: 'rgba(99,102,241,0.1)', color: '#818cf8', i18nLabel: 'dashboard.statsResumes' },
  { key: 'mentor_count' as const, icon: Bot, tint: 'rgba(34,211,238,0.1)', color: '#22d3ee', i18nLabel: 'dashboard.statsMentor' },
];

function StatBlock({ icon: Icon, value, label, tint, color }: { icon: any; value: number; label: string; tint: string; color: string }) {
  const animationsEnabled = useAnimationsEnabled();
  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="surface-card p-4 flex items-center gap-4"
    >
      <div className="p-2.5 rounded-lg shrink-0" style={{ backgroundColor: tint, color }}>
        <Icon size={16} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-lg font-extrabold mt-1 tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</span>
      </div>
    </motion.div>
  );
}

const ProfileForm = memo(function ProfileForm({
  profile, fullName, setFullName, password, setPassword,
  confirmPassword, setConfirmPassword, saving, error, message,
  onSubmit, t,
}: {
  profile: UserProfile | null;
  fullName: string;
  setFullName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  saving: boolean;
  error: string;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
  t: (k: string) => string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-email" className="label">{t('profile.email')}</label>
        <input id="profile-email" type="email" disabled value={profile?.email || ''} className="input-field text-xs opacity-60 cursor-not-allowed" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-username" className="label">{t('profile.username')}</label>
        <input id="profile-username" type="text" disabled value={profile?.username || ''} className="input-field text-xs opacity-60 cursor-not-allowed" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-fullname" className="label">{t('profile.fullName')}</label>
        <input
          id="profile-fullname"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ravi Kumar"
          className="input-field text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-password" className="label">{t('profile.newPassword')}</label>
          <input id="profile-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="input-field text-xs" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-confirm" className="label">{t('profile.confirmPassword')}</label>
          <input id="profile-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" className="input-field text-xs" />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary w-full sm:w-fit px-6 py-2.5 text-xs mt-2"
      >
        {saving ? (
          <>
            <RefreshCw className="animate-spin" size={14} />
            {t('profile.savingChanges')}
          </>
        ) : (
          <>
            <Save size={14} />
            {t('profile.saveChanges')}
          </>
        )}
      </button>
    </form>
  );
});

export default function ProfilePage() {
  const router = useRouter();
  const { user, isGuest, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const { loading: reqLoading } = useRequireRegistered();
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [guest, setGuest] = useState(false);

  const fetchProfile = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await fetchWithAuth('/users/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (resp.status === 401) { setGuest(true); setLoading(false); return; }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Failed to retrieve profile data.');
      setProfile(data.user);
      setStats(data.stats);
      setFullName(data.user.fullName || '');
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (authLoading || reqLoading) return;
    if (!isAuthenticated) { router.push(ROUTES.AUTH); return; }
    if (isGuest) { setGuest(true); setLoading(false); return; }
    fetchProfile();
  }, [authLoading, reqLoading, isAuthenticated, isGuest, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError(t('profile.pwMismatch'));
      return;
    }

    setSaving(true);

    try {
      const data = await api('/users/profile', {
        method: 'PUT',
        body: { fullName, ...(password ? { password } : {}) },
      });

      setMessage(t('profile.updated'));
      setPassword('');
      setConfirmPassword('');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.fullName = data.user.fullName;
        localStorage.setItem('user', JSON.stringify(u));
        refreshUser();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (guest) {
    return (
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto gap-4 min-h-[50vh]"
      >
        <div className="p-3.5 surface-card rounded-full text-2xl">🔒</div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('profile.disabledTitle')}</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t('profile.disabledDesc')}
        </p>
        <button
          onClick={() => { router.push(ROUTES.AUTH); }}
          className="btn btn-primary mt-2 px-5 py-2 text-xs"
        >
          {t('nav.signIn')} / {t('nav.register')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto py-4"
    >
      <div className="flex items-center gap-3">
        <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <User size={18} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h1">{t('profile.title')}</h1>
          <p className="text-caption mt-0.5">{t('profile.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="skeleton-shimmer h-4 rounded w-24 mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer surface-card rounded-xl h-[68px]" />
            ))}
          </div>
          <div className="md:col-span-2 skeleton-shimmer surface-card rounded-2xl p-6 h-[400px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
              {t('profile.activityStats')}
            </h3>
            {STAT_ITEMS.map((s) => (
              <StatBlock
                key={s.key}
                icon={s.icon}
                value={stats?.[s.key] || 0}
                label={t(s.i18nLabel)}
                tint={s.tint}
                color={s.color}
              />
            ))}
          </div>

          <div className="md:col-span-2 surface-card p-6 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
              {t('profile.editParams')}
            </h3>

            {error && (
              <div className="alert alert-error" role="alert">
                <Lock size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="alert alert-success" role="status">
                <ShieldCheck size={14} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <ProfileForm
              profile={profile}
              fullName={fullName}
              setFullName={setFullName}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              saving={saving}
              error={error}
              message={message}
              onSubmit={handleUpdate}
              t={t}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
