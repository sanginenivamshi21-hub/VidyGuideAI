'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface UserSettings {
  theme: string;
  language: string;
  accentColor: string;
  speechRate: number;
  speechPitch: number;
  voiceName: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoSpeak: boolean;
  autoTranslate: boolean;
  notifications: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
  defaultResumeStyle: string;
  chatHistory: boolean;
}

const DEFAULTS: UserSettings = {
  theme: 'dark',
  language: 'en',
  accentColor: 'emerald',
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceName: '',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2048,
  autoSpeak: false,
  autoTranslate: false,
  notifications: true,
  animations: true,
  sidebarCollapsed: false,
  defaultResumeStyle: 'professional',
  chatHistory: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    const user = localStorage.getItem('user');
    if (!user) { setLoading(false); return; }
    const parsedUser = JSON.parse(user);
    if (parsedUser.id === null) { setLoading(false); return; }
    try {
      const data = await api<any>('/settings');
      setSettings({ ...DEFAULTS, ...data });
      applyTheme(data.theme || DEFAULTS.theme);
      applyAccent(data.accentColor || DEFAULTS.accentColor);
    } catch {
      const cached = localStorage.getItem('vidyguide_settings');
      if (cached) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(cached) }); } catch {}
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('vidyguide_settings', JSON.stringify(next));
      return next;
    });

    if (updates.theme) applyTheme(updates.theme);
    if (updates.accentColor) applyAccent(updates.accentColor);
    if (updates.animations !== undefined) {
      document.documentElement.setAttribute('data-animations', String(updates.animations));
      localStorage.setItem('vidyguide_animations', String(updates.animations));
    }

    const user = localStorage.getItem('user');
    if (!user) return;

    setSaving(true);
    try {
      await api<any>('/settings', { method: 'PUT', body: updates });
    } catch {
      /* silent fail - already applied locally */
    }
    setSaving(false);
  }, []);

  return { settings, updateSettings, loading, saving };
}

export function applyTheme(theme: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
  localStorage.setItem('vidyguide_theme', theme);
}

export function applyAccent(color: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-accent', color);
  localStorage.setItem('vidyguide_accent', color);
}

export function initThemeAndAccent() {
  if (typeof document === 'undefined') return;
  const theme = localStorage.getItem('vidyguide_theme') || 'dark';
  const accent = localStorage.getItem('vidyguide_accent') || 'emerald';
  const animations = localStorage.getItem('vidyguide_animations');
  applyTheme(theme);
  applyAccent(accent);
  if (animations !== null) {
    document.documentElement.setAttribute('data-animations', animations);
  }
}

export const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 70B' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'te', label: 'Telugu (తెలుగు)' },
  { value: 'ta', label: 'Tamil (தமிழ்)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'ml', label: 'Malayalam (മലയാളം)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
];

export const ACCENT_COLORS = [
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];
