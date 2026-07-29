'use client';

import { useState, useCallback, useEffect } from 'react';

const MEMORY_KEY = 'vidyguide_memory';

export interface AIMemory {
  language: string;
  careerGoal: string;
  preferredTone: 'professional' | 'friendly' | 'encouraging';
  currentRoadmap: string;
  resumeVersion: string;
  interviewLevel: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  preferredLanguage: string;
  skills: string[];
  lastOpenedModule: string;
  recentMentorTopics: string[];
}

const DEFAULT_MEMORY: AIMemory = {
  language: 'en',
  careerGoal: '',
  preferredTone: 'encouraging',
  currentRoadmap: '',
  resumeVersion: '',
  interviewLevel: 'fresher',
  preferredLanguage: '',
  skills: [],
  lastOpenedModule: '',
  recentMentorTopics: [],
};

const LABELS: Record<keyof AIMemory, string> = {
  language: 'Language',
  careerGoal: 'Career goal',
  preferredTone: 'Tone preference',
  currentRoadmap: 'Current roadmap',
  resumeVersion: 'Resume version',
  interviewLevel: 'Interview level',
  preferredLanguage: 'Programming language',
  skills: 'Skills',
  lastOpenedModule: 'Last module',
  recentMentorTopics: 'Recent topics',
};

export function useMemory(onChange?: (label: string) => void) {
  const [memory, setMemoryState] = useState<AIMemory>(DEFAULT_MEMORY);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMemoryState({ ...DEFAULT_MEMORY, ...parsed });
      }
    } catch {}
  }, []);

  const notify = useCallback((key: keyof AIMemory) => {
    onChange?.(`${LABELS[key]} updated`);
  }, [onChange]);

  const persist = useCallback((next: AIMemory) => {
    setMemoryState(next);
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const updateMemory = useCallback(<K extends keyof AIMemory>(key: K, value: AIMemory[K]) => {
    setMemoryState((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(MEMORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    notify(key);
  }, [notify]);

  const clearMemory = useCallback(() => {
    setMemoryState(DEFAULT_MEMORY);
    try { localStorage.removeItem(MEMORY_KEY); } catch {}
  }, []);

  const getMemoryContext = useCallback((): string => {
    const parts: string[] = [];
    if (memory.careerGoal) parts.push(`Career goal: ${memory.careerGoal}`);
    if (memory.preferredLanguage) parts.push(`Preferred programming language: ${memory.preferredLanguage}`);
    if (memory.skills.length > 0) parts.push(`Known skills: ${memory.skills.join(', ')}`);
    if (memory.interviewLevel) parts.push(`Interview level: ${memory.interviewLevel}`);
    if (memory.currentRoadmap) parts.push(`Following roadmap: ${memory.currentRoadmap}`);
    if (memory.language && memory.language !== 'en') parts.push(`Reply in language: ${memory.language}`);
    parts.push(`Tone: ${memory.preferredTone}`);
    return parts.join('. ');
  }, [memory]);

  return { memory, updateMemory, clearMemory, getMemoryContext, persist };
}
