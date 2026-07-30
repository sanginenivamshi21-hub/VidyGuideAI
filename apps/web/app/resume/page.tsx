'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText, ScanSearch, Sparkles, Clock, ArrowRight,
  Star, Download, Plus, BarChart3, FileCheck,
} from 'lucide-react';

const RESUME_CARDS = [
  {
    icon: FileText,
    label: 'Resume Builder',
    desc: 'Build ATS-compatible resumes step by step',
    href: ROUTES.RESUME_BUILDER,
    color: '#818cf8',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/20',
  },
  {
    icon: ScanSearch,
    label: 'Resume Review',
    desc: 'ATS scoring, keyword analysis, grammar check',
    href: ROUTES.RESUME_REVIEW,
    color: '#f472b6',
    gradient: 'from-pink-500/20 to-pink-500/5',
    border: 'border-pink-500/20',
  },
  {
    icon: Clock,
    label: 'History',
    desc: 'View past resumes and versions',
    href: ROUTES.HISTORY,
    color: '#2dd4bf',
    gradient: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/20',
  },
];

export default function ResumeDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [recentResume, setRecentResume] = useState<{ title: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [atsScore, setAtsScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      api('/history?type=resume&limit=1').catch(() => []),
    ]).then(([history]) => {
      if (Array.isArray(history) && history.length > 0) {
        const latest = history[0];
        setRecentResume({ title: latest.title || 'Untitled Resume', updatedAt: latest.createdAt });
        if (latest.result?.atsScore) setAtsScore(latest.result.atsScore);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 max-w-2xl mx-auto pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl" style={{ backgroundColor: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
          <FileText size={22} style={{ color: '#818cf8' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Resume</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Build, review, and manage your resumes</p>
        </div>
      </div>

      {/* Resume Cards */}
      <div className="grid grid-cols-1 gap-3">
        {RESUME_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.25, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(card.href)}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} text-left card-hover`}
            >
              <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <Icon size={22} style={{ color: card.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{card.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* ATS Score Card */}
      {atsScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 size={12} style={{ color: 'var(--accent)' }} />
              Latest ATS Score
            </span>
            <span className="text-lg font-extrabold" style={{ color: atsScore >= 80 ? 'var(--accent)' : atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
              {atsScore}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${atsScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: atsScore >= 80 ? 'var(--accent)' : atsScore >= 50 ? '#f59e0b' : '#ef4444' }}
            />
          </div>
        </motion.div>
      )}

      {/* Recent Resume */}
      {recentResume && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.25 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Recent Resume</span>
          <p className="text-sm font-semibold mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{recentResume.title}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{recentResume.updatedAt}</p>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 mt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(ROUTES.RESUME_BUILDER)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          <Plus size={15} />
          New Resume
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(ROUTES.RESUME_REVIEW)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          <FileCheck size={15} />
          Review
        </motion.button>
      </div>
    </motion.div>
  );
}
