'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  Map,
  FileText,
  ScanSearch,
  Bot,
  Languages,
  Briefcase,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ROUTES, DASHBOARD_CARDS } from '@/lib/routes';
import { API_BASE } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(ROUTES.AUTH); return; }
    setUserName(user.fullName || user.username || 'Candidate');
    if (isGuest) { setLoading(false); return; }
    fetch(`${API_BASE}/users/profile`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.stats) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authLoading, user, isGuest, router]);

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-3xl">🌿</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{userName}</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Empowering students with localized AI career counseling, visual roadmaps, and ATS resume verification logs.
          </p>
        </div>

        {!isGuest && !loading && (
          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Roadmaps</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.career_count}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Resumes</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.resume_count}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Mentor</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.mentor_count}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={18} />
          Explore counseling tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DASHBOARD_CARDS.map((card, idx) => {
            const IconMap: Record<string, any> = {
              Compass,
              Map,
              FileText,
              ScanSearch,
              Bot,
              Languages,
              Briefcase,
            };
            const Icon = IconMap[card.icon];
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`p-6 border rounded-2xl flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer ${card.color}`}
              >
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <Icon size={20} />
                  </div>
                  <div className="p-1.5 rounded-full bg-slate-950 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-all text-sm tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
