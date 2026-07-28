'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase,
  ArrowRight, TrendingUp, AlertCircle,
} from 'lucide-react';
import { ROUTES, DASHBOARD_CARDS } from '@/lib/routes';
import { API_BASE } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[80px] flex-1">
      <Icon size={16} className="text-slate-500 mb-1" />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</span>
      <span className="text-xl font-extrabold text-white mt-1">{value}</span>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-800/60 border border-slate-800/80 rounded-2xl p-4 min-w-[80px] flex-1 h-[72px]" />
      ))}
    </div>
  );
}

function DashboardCard({ card, idx }: { card: typeof DASHBOARD_CARDS[number]; idx: number }) {
  const IconMap: Record<string, any> = {
    Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase,
  };
  const Icon = IconMap[card.icon] || Compass;

  return (
    <Link
      key={card.href}
      href={card.href}
      className="p-4 sm:p-6 border border-slate-800 rounded-2xl flex flex-col gap-4 group hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md cursor-pointer bg-slate-900/40"
    >
      <div className="flex justify-between items-center">
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-emerald-500/40 transition-all">
          <Icon size={18} className={card.color} />
        </div>
        <div className="p-1.5 rounded-full bg-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <ArrowRight size={14} className="text-white" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-all text-sm tracking-wide">
          {card.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {card.desc}
        </p>
      </div>
    </Link>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onRetry} className="text-xs font-semibold underline hover:text-red-300">Retry</button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = () => {
    if (isGuest || !isAuthenticated) {
      setLoading(false);
      return;
    }
    setError('');
    fetch(`${API_BASE}/users/profile`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then((data) => { if (data?.stats) setStats(data.stats); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(ROUTES.AUTH); return; }
    setUserName(user.fullName || user.username || 'Candidate');
    fetchProfile();
  }, [authLoading, user, isGuest, router]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto py-2 sm:py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 rounded-2xl sm:rounded-3xl relative overflow-hidden">
        <div className="flex flex-col gap-1.5 relative z-10">
          <span className="text-2xl sm:text-3xl" role="img" aria-label="leaf">🌿</span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Empowering students with localized AI career counseling, visual roadmaps, and ATS resume verification.
          </p>
        </div>

        {!isGuest && (
          <div className="relative z-10 w-full sm:w-auto">
            {loading ? (
              <StatsSkeleton />
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <StatCard label="Roadmaps" value={stats.career_count} icon={Map} />
                <StatCard label="Resumes" value={stats.resume_count} icon={FileText} />
                <StatCard label="Mentor" value={stats.mentor_count} icon={Bot} />
              </div>
            )}
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProfile} />}

      <div className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={16} />
          Explore counseling tools
        </h2>

        {loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 border border-slate-800 rounded-2xl animate-pulse bg-slate-900/40">
                <div className="w-10 h-10 bg-slate-800 rounded-xl mb-4" />
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800/60 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {DASHBOARD_CARDS.map((card, idx) => (
              <DashboardCard key={card.href} card={card} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
