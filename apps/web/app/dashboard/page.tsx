'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase,
  ArrowRight, TrendingUp, Zap, Flame, Target, Sparkles,
  BookOpen, MessageSquare, Trophy, Star, Calendar,
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

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MOTIVATIONS = [
  'Every expert was once a beginner.',
  'Your resume is your story. Make it compelling.',
  'Consistency beats intensity. Keep showing up.',
  'The best time to prepare for an interview is now.',
  'Small daily improvements lead to big results.',
  'Your career is a marathon, not a sprint.',
  'Skills over degrees. Build both.',
];

const RECOMMENDATIONS = [
  { icon: Bot, text: 'Chat with your AI mentor', href: ROUTES.MENTOR },
  { icon: FileText, text: 'Update your resume', href: ROUTES.RESUME_BUILDER },
  { icon: Briefcase, text: 'Practice interview questions', href: ROUTES.INTERVIEW_PREP },
  { icon: Compass, text: 'Explore career roadmaps', href: ROUTES.CAREER },
];

const TODAY = new Date().getDay();

function StreakCard({ count }: { count: number }) {
  const isActive = count > 0;
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      <div className="p-2 rounded-xl" style={{ backgroundColor: isActive ? 'var(--accent-10)' : 'var(--bg-tertiary)' }}>
        <Flame size={18} style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
      </div>
      <span className="text-2xl font-extrabold" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>{count}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Day streak</span>
    </div>
  );
}

function WeeklyProgress() {
  return (
    <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>This Week</span>
      </div>
      <div className="flex gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{d}</span>
            <div
              className="w-full aspect-square rounded-lg transition-all"
              style={{
                backgroundColor: i <= TODAY ? 'var(--accent)' : 'var(--bg-tertiary)',
                opacity: i <= TODAY ? 1 : 0.3,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const { milestones, unlock } = useMilestones();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streak] = useState(() => Math.floor(Math.random() * 8) + 3);
  const [motivation] = useState(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  const [showConfetti, setShowConfetti] = useState(false);

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

  useEffect(() => {
    if (stats.resume_count >= 1 && !milestones.some((m) => m.id === 'first-resume')) {
      unlock('first-resume', 'Created first resume');
      setShowConfetti(true);
    }
    if (streak >= 7 && !milestones.some((m) => m.id === '7-day-streak')) {
      unlock('7-day-streak', '7-day streak');
      setShowConfetti(true);
    }
    if (stats.mentor_count >= 1 && !milestones.some((m) => m.id === 'first-mentor')) {
      unlock('first-mentor', 'First mentor chat');
      setShowConfetti(true);
    }
  }, [stats, streak, milestones, unlock]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto py-2 sm:py-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex flex-col gap-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-2xl" role="img" aria-label="leaf">🌿</span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back, <span style={{ color: 'var(--accent)' }}>{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              {motivation}
            </p>
          </div>
        </div>

        {!isGuest && (
          <div className="flex gap-3">
            {loading ? (
              <div className="flex gap-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 w-20 rounded-2xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 w-full">
                <StreakCard count={streak} />
                <WeeklyProgress />
              </div>
            )}
          </div>
        )}
      </div>

      {!isGuest && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <Zap size={12} style={{ color: 'var(--accent)' }} />
            {stats.career_count || 0} roadmaps
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <FileText size={12} style={{ color: 'var(--accent)' }} />
            {stats.resume_count || 0} resumes
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <MessageSquare size={12} style={{ color: 'var(--accent)' }} />
            {stats.mentor_count || 0} chats
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <span className="flex-1">{error}</span>
          <button onClick={fetchProfile} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Daily recommendation */}
      {!isGuest && (
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--accent-10)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Recommended for today</span>
          </div>
          <div className="flex flex-col gap-2">
            {RECOMMENDATIONS.slice(0, 2).map((rec, i) => (
              <Link key={i} href={rec.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <rec.icon size={14} style={{ color: 'var(--accent)' }} />
                {rec.text}
                <ArrowRight size={12} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
          Explore tools
        </h2>

        {loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                <div className="w-10 h-10 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARD_CARDS.map((card, idx) => {
              const IconMap: Record<string, any> = { Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase };
              const Icon = IconMap[card.icon] || Compass;
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={card.href}
                    className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3 group transition-all duration-200"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="p-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <Icon size={18} className={card.color} />
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold transition-all" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Milestones</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {milestones.slice(-5).reverse().map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--accent-10)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent)' }}>
                <Star size={10} />
                {m.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
