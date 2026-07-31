'use client';

import { FileText, ScanSearch, Compass, Briefcase, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

const SUGGESTION_ICONS = [FileText, ScanSearch, Compass, Briefcase, Code];

interface SuggestionCardsProps {
  onSelect: (query: string) => void;
}

export default function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();

  const suggestions = [
    { label: t('mentor.sugResume'), query: t('mentor.sugResumeQuery') },
    { label: t('mentor.sugAts'), query: t('mentor.sugAtsQuery') },
    { label: t('mentor.sugCareer'), query: t('mentor.sugCareerQuery') },
    { label: t('mentor.sugInterview'), query: t('mentor.sugInterviewQuery') },
    { label: t('mentor.sugCoding'), query: t('mentor.sugCodingQuery') },
  ];

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-8 relative overflow-hidden">
      {/* Ambient glow behind the hero */}
      <motion.div
        aria-hidden
        initial={animationsEnabled ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, var(--accent-20) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="text-center max-w-xl mx-auto w-full relative">
        <motion.div
          initial={animationsEnabled ? { opacity: 0, scale: 0.85, y: 8 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto mb-5 w-fit"
        >
          <div
            className="rounded-3xl p-4"
            style={{
              backgroundColor: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Logo size={44} />
          </div>
        </motion.div>

        <motion.h2
          initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
          className="text-2xl font-extrabold tracking-tight mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('mentor.title')}
        </motion.h2>
        <motion.p
          initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
          className="text-sm mb-7"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('mentor.subtitle')}
        </motion.p>

        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
        >
          {suggestions.map((s, i) => {
            const Icon = SUGGESTION_ICONS[i % SUGGESTION_ICONS.length];
            return (
              <motion.button
                key={i}
                initial={animationsEnabled ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + i * 0.05, duration: 0.28, ease: 'easeOut' }}
                whileHover={animationsEnabled ? { y: -2, scale: 1.02 } : undefined}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(s.query)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-colors touch-manipulation"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--accent-10)', border: '1px solid var(--accent-20)' }}
                >
                  <Icon size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {s.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.p
          initial={animationsEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="text-[11px] mt-7"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('mentor.attachHint')}
        </motion.p>
      </div>
    </div>
  );
}
