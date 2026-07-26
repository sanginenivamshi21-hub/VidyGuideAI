'use client';

import { useEffect } from 'react';

export default function ThemeInit() {
  useEffect(() => {
    const theme = localStorage.getItem('vidyguide_theme') || 'dark';
    const accent = localStorage.getItem('vidyguide_accent') || 'emerald';

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    root.setAttribute('data-accent', accent);

    const animations = localStorage.getItem('vidyguide_animations');
    if (animations !== null) {
      root.setAttribute('data-animations', animations);
    }
  }, []);

  return null;
}
