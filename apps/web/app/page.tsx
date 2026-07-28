'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot, Compass, FileText, ScanSearch, Briefcase, ArrowRight,
  Sparkles, TrendingUp, Clock, CheckCircle, BookOpen, Award,
  MessageSquare, Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE } from '@/lib/api';

const QUICK_ACTIONS = [
  { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
  { icon: ScanSearch, label: 'Review Resume', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400', gradient: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20' },
  { icon: Compass, label: 'Career Guide', href: ROUTES.CAREER, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
  { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20' },
  { icon: FileText, label: 'Build Resume', href: ROUTES.RESUME_BUILDER, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20' },
  { icon: TrendingUp, label: 'Dashboard', href: ROUTES.DASHBOARD, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/20' },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<{ career_count: number; resume_count: number; mentor_count: number } | null>(null);
  const [recentChat, setRecentChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      fetch(`${API_BASE}/users/profile`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/conversations?limit=1`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([profile, convs]) => {
      if (profile?.stats) setStats(profile.stats);
      if (Array.isArray(convs) && convs.length > 0) setRecentChat(convs[0].title);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-8 max-w-lg mx-auto pt-8 pb-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit text-emerald-400 text-xs font-semibold">
            <Sparkles size={13} />
            AI Career Platform
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Your AI-powered<br />
            <span className="text-emerald-400">career companion</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Build resumes, practice interviews, get career guidance, and chat with an AI mentor — all in one place.
          </p>
          <button
            onClick={() => router.push(ROUTES.AUTH)}
            className="mt-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push(ROUTES.MENTOR)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Try AI Mentor
            <MessageSquare size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.slice(0, 4).map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.border} bg-gradient-to-br ${action.gradient} transition-all active:scale-[0.97]`}
              >
                <Icon size={22} className={action.color} />
                <span className="text-[10px] font-semibold text-slate-300 text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const name = user?.fullName || user?.username || 'there';

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto pb-20">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          {greeting}, <span className="text-emerald-400">{name.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-slate-400">
          Here&apos;s your career snapshot
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Roadmaps', value: stats.career_count, icon: Compass, color: 'text-emerald-400' },
            { label: 'Resumes', value: stats.resume_count, icon: FileText, color: 'text-indigo-400' },
            { label: 'Chats', value: stats.mentor_count, icon: MessageSquare, color: 'text-cyan-400' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center gap-1">
                <Icon size={16} className={s.color} />
                <span className="text-lg font-extrabold text-white">{s.value}</span>
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-800 rounded-2xl p-3 h-20" />
          ))}
        </div>
      )}

      {/* Continue where you left off */}
      {recentChat && (
        <button
          onClick={() => router.push(ROUTES.MENTOR)}
          className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl transition-all active:scale-[0.98] text-left"
        >
          <div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0">
            <MessageSquare size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Continue Chat</span>
            <p className="text-xs text-slate-300 truncate mt-0.5">{recentChat}</p>
          </div>
          <ArrowRight size={16} className="text-slate-500 shrink-0" />
        </button>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={13} className="text-emerald-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${action.border} bg-gradient-to-br ${action.gradient} transition-all active:scale-[0.97]`}
              >
                <Icon size={20} className={action.color} />
                <span className="text-[9px] font-semibold text-slate-300 text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested next steps */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-emerald-400" />
          Suggested
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { icon: ScanSearch, label: 'Get your resume reviewed', desc: 'ATS score & feedback', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
            { icon: Briefcase, label: 'Practice interview questions', desc: 'Role-specific prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
            { icon: Compass, label: 'Explore career paths', desc: 'Personalized roadmap', href: ROUTES.CAREER, color: 'text-emerald-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl transition-all active:scale-[0.98] text-left"
              >
                <Icon size={18} className={item.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-600 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
