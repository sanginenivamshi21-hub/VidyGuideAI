'use client';

import { Menu, SquarePen, Keyboard, PanelLeftClose, PanelLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();

  return (
    <div
      className="flex items-center justify-between px-4 py-2 lg:py-3 shrink-0 safe-area-top z-20"
      style={{
        backgroundColor: 'var(--glass-bg-strong)',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDrawer}
          className="lg:hidden p-2 -ml-1 rounded-lg transition-colors touch-manipulation"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={t('nav.openConversations')}
        >
          <Menu size={19} />
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
            className="hidden lg:flex p-2 -ml-1 rounded-lg transition-colors touch-manipulation"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        )}
        <div className="hidden lg:flex items-center gap-2">
          <Logo size={20} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('mentor.title')}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="hidden lg:block p-2 rounded-lg transition-colors touch-manipulation"
            style={{ color: 'var(--text-secondary)' }}
            title={t('mentor.newChat')}
            aria-label={t('mentor.newChat')}
          >
            <SquarePen size={16} />
          </button>
        )}
        <button
          onClick={onToggleShortcuts}
          className="p-2 rounded-lg transition-colors touch-manipulation"
          style={{ color: 'var(--text-secondary)' }}
          title="Keyboard shortcuts"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </div>
  );
}
