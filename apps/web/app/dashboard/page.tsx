'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase,
  ArrowRight, TrendingUp, AlertCircle, Sparkles,
} from 'lucide-react';
import { ROUTES, DASHBOARD_CARDS } from '@/lib/routes';
import { api } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

const CARD_ICONS: Record<string, any> = {
  Compass, Map, FileText, ScanSearch, Bot, Languages, Briefcase,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

function StatCard({ label, value, icon: Icon, index }: { label: string; value: number; icon: any; index: number }) {
  const animationsEnabled = useAnimationsEnabled();
  return (
    <motion.div
      variants={item}
      initial={animationsEnabled ? 'hidden' : false}
      animate="show"
      className="glass surface-card flex flex-col items-center p-3.5 sm:p-4 min-w-[72px] flex-1"
    >
      <Icon size={15} className="mb-1" style={{ color: 'var(--accent)' }} />
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <motion.span
        initial={animationsEnabled ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 + index * 0.06, duration: 0.3 }}
        className="text-xl sm:text-2xl font-extrabold mt-1 tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex items-center gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-shimmer surface-card p-4 min-w-[72px] flex-1 h-[76px] rounded-2xl" />
      ))}
    </div>
  );
}

function DashboardCard({ card, idx }: { card: typeof DASHBOARD_CARDS[number]; idx: number }) {
  const animationsEnabled = useAnimationsEnabled();
  const Icon = CARD_ICONS[card.icon] || Compass;
  return (
    <motion.div variants={item} initial={animationsEnabled ? 'hidden' : false} animate="show">
      <Link
        href={card.href}
        className="glass surface-card p-4 sm:p-5 flex flex-col gap-4 group card-hover h-full"
        aria-label={card.title}
      >
        <div className="flex justify-between items-center">
          <div className="icon-box transition-colors" style={{ backgroundColor: 'var(--accent-10)' }}>
            <Icon size={18} className={card.color} />
          </div>
          <div
            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)' }}
          >
            <ArrowRight size={14} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-sm tracking-wide transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
            {card.title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {card.desc}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function ErrorBanner({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return (
    <div className="alert alert-error" role="alert">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onRetry} className="text-xs font-semibold underline">{retryLabel}</button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    if (isGuest || !isAuthenticated) {
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await api('/users/profile');
      if (data?.stats) setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(ROUTES.AUTH); return; }
    setUserName(user.fullName || user.username || 'Candidate');
    fetchProfile();
  }, [authLoading, user, isGuest, router]);

  const hero = useMemo(() => (
    <div
      className="relative overflow-hidden surface-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 55%, var(--accent-10) 130%)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent-10) 0%, transparent 70%)' }}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 relative z-10">
        <div className="flex flex-col gap-1.5">
          <motion.span
            initial={animationsEnabled ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.05 }}
            className="text-2xl sm:text-3xl w-fit"
            role="img"
            aria-label="leaf"
          >
            🌿
          </motion.span>
          <motion.h1
            initial={animationsEnabled ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('dashboard.welcomeBack')}, <span style={{ color: 'var(--accent)' }}>{userName}</span>
          </motion.h1>
          <p className="text-xs sm:text-sm max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.tagline')}
          </p>
        </div>

        {!isGuest && (
          <div className="w-full sm:w-auto">
            {loading ? (
              <StatsSkeleton />
            ) : (
              <motion.div
                variants={container}
                initial={animationsEnabled ? 'hidden' : false}
                animate="show"
                className="flex gap-2 sm:gap-3"
              >
                <StatCard label={t('dashboard.statsRoadmaps')} value={stats.career_count} icon={Map} index={0} />
                <StatCard label={t('dashboard.statsResumes')} value={stats.resume_count} icon={FileText} index={1} />
                <StatCard label={t('dashboard.statsMentor')} value={stats.mentor_count} icon={Bot} index={2} />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  ), [userName, stats, loading, isGuest, t, animationsEnabled]);

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto py-2 sm:py-4"
    >
      {hero}

      {error && <ErrorBanner message={error} onRetry={fetchProfile} retryLabel={t('common.retry')} />}

      <div className="flex flex-col gap-3 sm:gap-4">
        <motion.h2
          initial={animationsEnabled ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="text-base sm:text-lg font-bold flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
          {t('dashboard.exploreTools')}
        </motion.h2>

        {loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-shimmer surface-card p-6 rounded-2xl h-36" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial={animationsEnabled ? 'hidden' : false}
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {DASHBOARD_CARDS.map((card, idx) => (
              <DashboardCard key={card.href} card={card} idx={idx} />
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={animationsEnabled ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 justify-center text-[10px] font-medium py-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <Sparkles size={12} style={{ color: 'var(--accent)' }} />
        VidyGuideAI · Premium AI SaaS
      </motion.div>
    </motion.div>
  );
}
