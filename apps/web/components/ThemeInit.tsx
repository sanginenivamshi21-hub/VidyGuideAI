'use client';

import { useEffect } from 'react';

function applyTheme(theme: string) {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

export function changeTheme(theme: string) {
  localStorage.setItem('vidyguide_theme', theme);
  applyTheme(theme);
}

export function changeAccent(accent: string) {
  localStorage.setItem('vidyguide_accent', accent);
  document.documentElement.setAttribute('data-accent', accent);
}

export default function ThemeInit() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const theme = localStorage.getItem('vidyguide_theme') || 'dark';
      if (theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  return null;
}
