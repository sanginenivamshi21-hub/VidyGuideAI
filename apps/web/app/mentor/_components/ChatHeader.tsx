'use client';

import { Menu, SquarePen, Keyboard, PanelLeftClose, PanelLeft } from 'lucide-react';
import Logo from '@/components/Logo';

interface ChatHeaderProps {
  onToggleDrawer: () => void;
  onNewChat: () => void;
  onToggleShortcuts: () => void;
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
  hasMessages: boolean;
}

export default function ChatHeader({
  onToggleDrawer,
  onNewChat,
  onToggleShortcuts,
  onToggleSidebar,
  showSidebar,
  hasMessages,
}: ChatHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 lg:py-3 shrink-0 safe-area-top z-20"
      style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDrawer}
          className="lg:hidden p-2 -ml-1 rounded-lg transition-colors touch-manipulation"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open conversations"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="9.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="14.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={onToggleDrawer}
          className="lg:hidden p-1 -ml-2 rounded-lg transition-colors"
          aria-label="Logo"
        >
          <Logo size={22} />
        </button>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 -ml-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        )}
        <div className="hidden lg:flex items-center gap-2">
          <Logo size={20} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Mentor</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="hidden lg:block p-2 rounded-lg transition-colors touch-manipulation"
            style={{ color: 'var(--text-secondary)' }}
            title="New chat"
          >
            <SquarePen size={16} />
          </button>
        )}
        <button
          onClick={onToggleShortcuts}
          className="p-2 rounded-lg transition-colors touch-manipulation"
          style={{ color: 'var(--text-secondary)' }}
          title="Keyboard shortcuts"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </div>
  );
}
