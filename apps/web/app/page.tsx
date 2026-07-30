'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot, Compass, FileText, ScanSearch, Briefcase, ArrowRight,
  Sparkles, TrendingUp, Clock, CheckCircle, BookOpen, Award,
  MessageSquare, Zap, Flame, Target, BarChart3, Sun,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

const QUICK_ACTIONS = [
  { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
  { icon: ScanSearch, label: 'Review Resume', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400', gradient: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20' },
  { icon: Compass, label: 'Career Guide', href: ROUTES.CAREER, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
  { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20' },
  { icon: FileText, label: 'Build Resume', href: ROUTES.RESUME_BUILDER, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20' },
  { icon: TrendingUp, label: 'Dashboard', href: ROUTES.DASHBOARD, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/20' },
];

const MOTIVATIONAL_QUOTES = [
  'Your career journey starts with a single step.',
  'Every expert was once a beginner.',
  'The best time to prepare for your future is now.',
  'Skills are the new currency of the job market.',
  'Your resume is your story — make it compelling.',
  'Consistency beats intensity. Keep showing up.',
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<{ career_count: number; resume_count: number; mentor_count: number } | null>(null);
  const [recentChat, setRecentChat] = useState<{ title: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Hello');
  const [streak, setStreak] = useState(0);
  const [motivation] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      api('/users/profile').catch(() => null),
      api('/conversations?limit=1').catch(() => []),
    ]).then(([profile, convs]) => {
      if (profile?.stats) setStats(profile.stats);
      if (profile?.streak) setStreak(profile.streak);
      if (Array.isArray(convs) && convs.length > 0) {
        setRecentChat({ title: convs[0].title, updatedAt: convs[0].updatedAt });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-8 max-w-lg mx-auto pt-8 pb-8"
      >
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-xs font-semibold"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent)' }}
          >
            <Sparkles size={13} />
            AI Career Platform
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
            Your AI-powered<br />
            <span style={{ color: 'var(--accent)' }}>career companion</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Build resumes, practice interviews, get career guidance, and chat with an AI mentor — all in one place.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(ROUTES.AUTH)}
            className="mt-2 w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(ROUTES.MENTOR)}
            className="w-full py-3 font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            Try AI Mentor
            <MessageSquare size={16} />
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {QUICK_ACTIONS.slice(0, 4).map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.href}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.border} bg-gradient-to-br ${action.gradient} transition-all`}
              >
                <Icon size={22} className={action.color} />
                <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    );
  }

  const name = user?.fullName || user?.username || 'there';
  const firstName = name.split(' ')[0];

  const totalActions = (stats?.career_count || 0) + (stats?.resume_count || 0) + (stats?.mentor_count || 0);
  const progressLevel = Math.min(100, Math.floor(totalActions / 3));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-5 max-w-lg mx-auto pb-8"
    >
      {/* Greeting + Streak */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {greeting}, <span style={{ color: 'var(--accent)' }}>{firstName}</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Here&apos;s your career snapshot
          </p>
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <Flame size={14} />
            {streak} day{streak !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>

      {/* Motivational Insight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-start gap-3 p-3.5 rounded-2xl"
        style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {motivation}
        </p>
      </motion.div>

      {/* Stats row */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { label: 'Roadmaps', value: stats.career_count, icon: Compass, color: 'var(--accent)' },
            { label: 'Resumes', value: stats.resume_count, icon: FileText, color: '#818cf8' },
            { label: 'Chats', value: stats.mentor_count, icon: MessageSquare, color: '#22d3ee' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <Icon size={16} style={{ color: s.color }} />
                <span className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
              </div>
            );
          })}
        </motion.div>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-3 h-20 animate-pulse" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
          ))}
        </div>
      )}

      {/* Career Progress */}
      {totalActions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 size={12} style={{ color: 'var(--accent)' }} />
              Career Progress
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{progressLevel}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {totalActions} action{totalActions !== 1 ? 's' : ''} taken
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Next milestone: {progressLevel < 50 ? '10 actions' : '25 actions'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Continue where you left off */}
      {recentChat && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(ROUTES.MENTOR)}
          className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
          style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
            <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Continue Chat</span>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{recentChat.title}</p>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
        </motion.button>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Zap size={13} style={{ color: 'var(--accent)' }} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.href}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${action.border} bg-gradient-to-br ${action.gradient} transition-all`}
              >
                <Icon size={20} className={action.color} />
                <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Suggested next steps */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Sparkles size={13} style={{ color: 'var(--accent)' }} />
          Suggested
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { icon: ScanSearch, label: 'Get your resume reviewed', desc: 'ATS score & feedback', href: ROUTES.RESUME_REVIEW, color: '#818cf8' },
            { icon: Briefcase, label: 'Practice interview questions', desc: 'Role-specific prep', href: ROUTES.INTERVIEW_PREP, color: '#a78bfa' },
            { icon: Compass, label: 'Explore career paths', desc: 'Personalized roadmap', href: ROUTES.CAREER, color: 'var(--accent)' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.href}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <Icon size={18} style={{ color: item.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
