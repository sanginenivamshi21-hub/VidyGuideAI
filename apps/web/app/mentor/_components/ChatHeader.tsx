import { Menu, SquarePen, Keyboard, PanelLeftClose, PanelLeft } from 'lucide-react';

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
      className="flex items-center justify-between px-4 py-3 border-b shrink-0 safe-area-top"
      style={{ backgroundColor: 'rgba(15,23,42,0.8)', borderColor: 'rgba(51,65,85,0.5)' }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDrawer}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-400 active:bg-slate-700 transition-colors touch-manipulation"
          aria-label="Open conversations"
        >
          <Menu size={20} />
        </button>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        )}
        <h1 className="text-sm font-bold text-white tracking-wide">AI Mentor</h1>
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 active:bg-slate-700 transition-colors touch-manipulation"
            title="New chat"
          >
            <SquarePen size={16} />
          </button>
        )}
        <button
          onClick={onToggleShortcuts}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 active:bg-slate-700 transition-colors touch-manipulation"
          title="Keyboard shortcuts"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </div>
  );
}
