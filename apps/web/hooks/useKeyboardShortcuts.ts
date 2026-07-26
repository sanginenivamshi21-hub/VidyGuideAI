'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(actions: ShortcutAction[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    for (const action of actions) {
      const ctrl = action.ctrl !== false ? e.ctrlKey || e.metaKey : true;
      const shift = action.shift ? e.shiftKey : !e.shiftKey;
      const alt = action.alt ? e.altKey : !e.altKey;
      const keyMatch = e.key.toLowerCase() === action.key.toLowerCase() ||
                       e.key === action.key;

      if (keyMatch && ctrl && shift && alt) {
        e.preventDefault();
        e.stopPropagation();
        action.handler();
        return;
      }
    }

    if (e.key === 'Escape') {
      for (const action of actions) {
        if (action.key === 'Escape' && action.ctrl === undefined) {
          action.handler();
          return;
        }
      }
    }
  }, [actions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const DEFAULT_SHORTCUTS = [
  { key: '/', ctrl: true, shift: false, alt: false, description: 'Toggle shortcuts dialog' },
  { key: 'Enter', ctrl: true, shift: false, alt: false, description: 'Send message' },
  { key: 'Escape', ctrl: false, description: 'Stop generation / Close dialog' },
  { key: 'm', ctrl: true, shift: true, alt: false, description: 'Mute/unmute speech' },
  { key: 'k', ctrl: true, shift: false, alt: false, description: 'Search conversations' },
  { key: 'n', ctrl: true, shift: true, alt: false, description: 'New chat' },
  { key: ',', ctrl: true, shift: false, alt: false, description: 'Open settings' },
];
