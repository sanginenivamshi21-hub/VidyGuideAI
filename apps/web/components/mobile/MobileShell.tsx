'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Compass,
  Briefcase,
  ScanSearch,
  Languages,
  Clock,
  Menu,
  User,
  Settings,
  LogOut,
  Flame,
  HelpCircle,
  Info,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';
import Logo from '../Logo';
import { changeTheme, changeAccent } from '../ThemeInit';

const THEME_OPTIONS = [
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'system', icon: Monitor, label: 'System' },
];

const ACCENTS = ['emerald', 'blue', 'purple', 'orange', 'red', 'pink', 'cyan'] as const;

interface TabItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const BOTTOM_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Home', href: ROUTES.DASHBOARD },
  { icon: Bot, label: 'Mentor', href: ROUTES.MENTOR },
  { icon: FileText, label: 'Resume', href: ROUTES.RESUME },
  { icon: Compass, label: 'Career', href: ROUTES.CAREER },
];

const DRAWER_ITEMS = [
  { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP },
  { icon: ScanSearch, label: 'OCR Scanner', href: ROUTES.OCR },
  { icon: Languages, label: 'Translator', href: ROUTES.TRANSLATOR },
  { icon: Clock, label: 'History', href: ROUTES.HISTORY },
  { icon: User, label: 'Profile', href: ROUTES.PROFILE },
  { icon: Settings, label: 'Settings', href: ROUTES.SETTINGS },
  { icon: HelpCircle, label: 'Help', href: '/help' },
  { icon: Info, label: 'About', href: '/about' },
];

function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [currentAccent, setCurrentAccent] = useState('emerald');

  useEffect(() => {
    try {
      setCurrentTheme(localStorage.getItem('vidyguide_theme') || 'dark');
      setCurrentAccent(localStorage.getItem('vidyguide_accent') || 'emerald');
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleTheme = (t: string) => { setCurrentTheme(t); changeTheme(t); };
  const handleAccent = (a: string) => { setCurrentAccent(a); changeAccent(a); };

  const navigate = (href: string) => { onClose(); router.push(href); };

  const isActiveHref = (href: string) => {
    const pathname = window.location.pathname;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden"
      style={{ width: 280, maxWidth: '85vw', backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)' }}
    >
      <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}>
              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.fullName || user.username}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Flame size={10} style={{ color: 'var(--accent)' }} />
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{Math.floor(Math.random() * 8) + 3} day streak</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Guest</div>
              <button onClick={() => navigate(ROUTES.AUTH)}
                className="text-[11px] font-medium underline mt-0.5" style={{ color: 'var(--accent)' }}>
                Sign in to save progress
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin space-y-1">
        {DRAWER_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActiveHref(item.href);
          return (
            <button key={item.href} onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? 'var(--accent-10)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={18} style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-1 mb-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentTheme === opt.id;
            return (
              <button key={opt.id} onClick={() => handleTheme(opt.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-10)' : 'var(--bg-tertiary)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--accent-20)' : '1px solid transparent',
                }}
              >
                <Icon size={12} /> {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 justify-center">
          {ACCENTS.map((a) => (
            <button key={a} onClick={() => handleAccent(a)}
              className="w-7 h-7 rounded-full transition-transform active:scale-75"
              style={{
                backgroundColor: 
                  a === 'emerald' ? '#10b981' :
                  a === 'blue' ? '#3b82f6' :
                  a === 'purple' ? '#8b5cf6' :
                  a === 'orange' ? '#f97316' :
                  a === 'red' ? '#ef4444' :
                  a === 'pink' ? '#ec4899' : '#06b6d4',
                border: '2px solid transparent',
                outline: a === currentAccent ? '2px solid var(--accent)' : 'none',
                outlineOffset: '2px',
              }}
              aria-label={a}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {isAuthenticated ? (
          <button onClick={() => { onClose(); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut size={18} /> Log out
          </button>
        ) : (
          <button onClick={() => navigate(ROUTES.AUTH)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--accent)' }}>
            <User size={18} /> Sign in
          </button>
        )}
      </div>
    </motion.aside>
  );
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => { closeDrawer(); }, [pathname, closeDrawer]);

  const canShowShell = isAuthenticated || isGuest;
  if (!canShowShell) return <>{children}</>;

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'G';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header
        className="flex items-center justify-between h-11 px-3 shrink-0 z-10"
        style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-lg transition-all active:scale-90"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Logo size={18} showText textSize="text-sm" />
        </div>
        <button onClick={() => router.push(ROUTES.PROFILE)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all active:scale-90"
          style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}
          aria-label="Profile"
        >
          {initial}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto safe-area-bottom">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav
        className="flex items-center shrink-0 h-14 px-1 safe-area-bottom z-20"
        style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-default)' }}
      >
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-lg transition-all active:scale-95"
              style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className="text-[9px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
        {/* More button — opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-lg transition-all active:scale-95"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="More options"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
          <span className="text-[9px] font-semibold tracking-wide">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            />
            <MobileDrawer isOpen={drawerOpen} onClose={closeDrawer} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
