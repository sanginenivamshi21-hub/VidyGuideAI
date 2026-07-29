'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame, Zap, Bot, FileText, Compass, Briefcase,
  ArrowRight, TrendingUp, MessageSquare, Clock,
  Sparkles, BookOpen, Star, Trophy,
  CheckCircle,
} from 'lucide-react';
import { ROUTES, DASHBOARD_CARDS } from '@/lib/routes';
import { API_BASE } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import Confetti, { useMilestones } from '@/components/Confetti';

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

const QUOTES = [
  'Your career is a story. Make it a bestseller.',
  'Skills compound. Invest in yourself daily.',
  'The best resume is a list of things you built.',
  'Interviews are conversations. Prepare, then trust yourself.',
  'Every expert was once a beginner who never gave up.',
  'Your only competition is the person you were yesterday.',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUICK_ACTIONS = [
  { icon: Bot, label: 'New Chat', href: ROUTES.MENTOR, color: 'var(--accent)' },
  { icon: FileText, label: 'Resume', href: ROUTES.RESUME_BUILDER, color: '#3b82f6' },
  { icon: Compass, label: 'Roadmap', href: ROUTES.CAREER, color: '#8b5cf6' },
  { icon: Briefcase, label: 'Interview', href: ROUTES.INTERVIEW_PREP, color: '#f97316' },
];

const TODAY = new Date().getDay();

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const { milestones, unlock } = useMilestones();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streak] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vidyguide_streak') : null;
    return saved ? parseInt(saved) : Math.floor(Math.random() * 5) + 1;
  });
  const [xp] = useState(() => Math.floor(Math.random() * 400) + 100);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchProfile = () => {
    if (isGuest || !isAuthenticated) { setLoading(false); return; }
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
    try { localStorage.setItem('vidyguide_streak', String(streak)); } catch {}
  }, [authLoading, user, isGuest, router]);

  useEffect(() => {
    if (stats.resume_count >= 1 && !milestones.some((m) => m.id === 'first-resume')) {
      unlock('first-resume', 'Created first resume');
      setShowConfetti(true);
    }
    if (stats.mentor_count >= 1 && !milestones.some((m) => m.id === 'first-mentor')) {
      unlock('first-mentor', 'First mentor chat');
      setShowConfetti(true);
    }
  }, [stats, milestones, unlock]);

  const recentActivity = [
    ...(stats.mentor_count > 0 ? [{ icon: Bot, text: `${stats.mentor_count} AI Mentor sessions`, time: 'Today', href: ROUTES.MENTOR }] : []),
    ...(stats.resume_count > 0 ? [{ icon: FileText, text: `${stats.resume_count} resumes built`, time: 'This week', href: ROUTES.RESUME }] : []),
    ...(stats.career_count > 0 ? [{ icon: Compass, text: `${stats.career_count} career roadmaps`, time: 'This week', href: ROUTES.CAREER }] : []),
  ];

  const hasActivity = recentActivity.length > 0;

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-8 max-w-6xl mx-auto pt-4 sm:pt-6">
      <Confetti active={showConfetti} />

      {/* Greeting + Quote */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" role="img" aria-label="wave">👋</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span style={{ color: 'var(--accent)' }}>{userName}</span>
          </h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{quote}</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
          <Flame size={12} style={{ color: 'var(--accent)' }} />
          <span>{streak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
          <Zap size={12} style={{ color: '#f59e0b' }} />
          <span>{xp} XP</span>
        </div>
        {!isGuest && (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <FileText size={12} style={{ color: '#3b82f6' }} />
              <span>{stats.resume_count || 0} resumes</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <MessageSquare size={12} style={{ color: '#8b5cf6' }} />
              <span>{stats.mentor_count || 0} chats</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <span className="flex-1">{error}</span>
          <button onClick={fetchProfile} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.label} href={a.href}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${a.color}15` }}>
              <a.icon size={16} style={{ color: a.color }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Weekly Progress + Daily Recommendation */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Weekly Progress */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>This Week</span>
          </div>
          <div className="flex gap-1">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{d.charAt(0)}</span>
                <div
                  className="w-full rounded-lg transition-all"
                  style={{
                    height: 24 + Math.sin(i * 1.2) * 12 + 'px',
                    backgroundColor: i <= TODAY ? 'var(--accent)' : 'var(--bg-tertiary)',
                    opacity: i <= TODAY ? 0.7 + Math.random() * 0.3 : 0.2,
                    borderRadius: '6px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Daily Recommendation */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--accent-10)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Today&apos;s Suggestion</span>
          </div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            {stats.mentor_count === 0
              ? 'Start a conversation with your AI Mentor to get personalized career advice.'
              : stats.resume_count === 0
              ? 'Build your first ATS-compatible resume to stand out.'
              : 'Practice interview questions to prepare for your next opportunity.'
            }
          </p>
          <Link href={stats.mentor_count === 0 ? ROUTES.MENTOR : stats.resume_count === 0 ? ROUTES.RESUME_BUILDER : ROUTES.INTERVIEW_PREP}
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all"
            style={{ color: 'var(--accent)' }}
          >
            Get started <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {hasActivity && (
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Activity</span>
          </div>
          <div className="flex flex-col gap-1">
            {recentActivity.slice(0, 3).map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all active:scale-[0.98]"
                style={{ color: 'var(--text-primary)' }}
              >
                <a.icon size={14} style={{ color: 'var(--accent)' }} />
                <span className="flex-1">{a.text}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.time}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BookOpen size={14} style={{ color: 'var(--accent)' }} />
          Explore tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DASHBOARD_CARDS.map((card, idx) => {
            const IconMap: Record<string, any> = { Compass: Compass, Map: TrendingUp, FileText: FileText, ScanSearch: Star, Bot: Bot, Languages: BookOpen, Briefcase: Briefcase };
            const Icon = IconMap[card.icon] || Compass;
            return (
              <motion.div key={card.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Link href={card.href}
                  className="p-4 rounded-2xl flex flex-col gap-2.5 group transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex justify-between items-center">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Icon size={15} className={card.color} />
                    </div>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{card.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.desc}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      {milestones.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Achievements</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {milestones.slice(-4).reverse().map((m) => (
              <div key={m.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'var(--accent-10)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent)' }}>
                <CheckCircle size={10} />
                {m.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
