'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

const MILESTONES_KEY = 'vidyguide_milestones';

interface Milestone {
  id: string;
  label: string;
  unlockedAt: number;
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MILESTONES_KEY);
      if (stored) setMilestones(JSON.parse(stored));
    } catch {}
  }, []);

  const unlock = (id: string, label: string) => {
    if (milestones.some((m) => m.id === id)) return false;
    const next = [...milestones, { id, label, unlockedAt: Date.now() }];
    setMilestones(next);
    try { localStorage.setItem(MILESTONES_KEY, JSON.stringify(next)); } catch {}
    return true;
  };

  return { milestones, unlock };
}

export default function Confetti({ active, duration = 3000 }: { active: boolean; duration?: number }) {
  const [show, setShow] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!active) { setShow(false); return; }
    setShow(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!show) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={200}
      tweenDuration={duration}
      colors={['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0']}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
