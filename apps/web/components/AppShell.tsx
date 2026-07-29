'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, LogOut, Settings, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import MobileShell from './mobile/MobileShell';
import SoftAurora from './SoftAuroraWrapper';
import { ToastProvider } from './Toast';

function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
    >
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}>
          {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.username}</div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Flame size={10} style={{ color: 'var(--accent)' }} /> Free Plan
          </div>
        </div>
      </div>
      <button onClick={() => { onClose(); router.push('/profile'); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all" style={{ color: 'var(--text-secondary)' }}>
        <User size={15} /> Profile
      </button>
      <button onClick={() => { onClose(); router.push('/settings'); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all" style={{ color: 'var(--text-secondary)' }}>
        <Settings size={15} /> Settings
      </button>
      <button onClick={() => { onClose(); logout(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  if (loading) return null;

  if (!isAuthenticated) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="hidden lg:flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Desktop top bar */}
          <header className="flex items-center justify-between h-11 px-4 shrink-0 z-10" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>VidyGuideAI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/search')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              >
                <Search size={13} />
                <span>Search...</span>
                <span className="text-[9px] px-1 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }}>⌘K</span>
              </button>
              <button className="p-1.5 rounded-lg transition-all relative" style={{ color: 'var(--text-secondary)' }} aria-label="Notifications">
                <Bell size={16} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all active:scale-90"
                  style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}
                  aria-label="Profile menu"
                >
                  {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                </button>
                {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto relative flex flex-col safe-area-bottom">
            <SoftAurora speed={0.4} scale={1.2} brightness={0.8} />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 z-10 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <div className="lg:hidden">
        <MobileShell>{children}</MobileShell>
      </div>
    </ToastProvider>
  );
}
