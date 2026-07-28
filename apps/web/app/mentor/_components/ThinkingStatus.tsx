'use client';

import { useState, useEffect } from 'react';

const THINKING_MESSAGES = [
  'Thinking...',
  'Analyzing your request...',
  'Searching relevant information...',
  'Understanding your profile...',
  'Preparing the best answer...',
  'Reviewing previous context...',
  'Building your roadmap...',
  'Generating personalized advice...',
];

export default function ThinkingStatus() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % THINKING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="flex justify-start mb-4 status-enter">
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2.5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
        <span className="text-xs font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          {THINKING_MESSAGES[index]}
        </span>
      </div>
    </div>
  );
}
