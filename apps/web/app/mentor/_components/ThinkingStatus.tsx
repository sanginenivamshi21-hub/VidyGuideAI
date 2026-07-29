'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THINKING_MESSAGES = [
  'Thinking...',
  'Analyzing your profile...',
  'Reading your resume...',
  'Finding the best answer...',
  'Searching career knowledge...',
  'Preparing personalized guidance...',
  'Comparing opportunities...',
  'Optimizing recommendations...',
  'Almost ready...',
];

export default function ThinkingStatus() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fadeState, setFadeState] = useState<'visible' | 'exiting'>('visible');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    intervalRef.current = setInterval(() => {
      setFadeState('exiting');
      setTimeout(() => {
        setIndex((i) => (i + 1) % THINKING_MESSAGES.length);
        setFadeState('visible');
      }, 200);
    }, 2800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex justify-start mb-4"
    >
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2.5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={THINKING_MESSAGES[index]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {THINKING_MESSAGES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
