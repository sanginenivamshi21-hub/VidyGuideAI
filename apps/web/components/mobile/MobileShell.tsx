'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  Home, Bot, FileText, Compass, LayoutDashboard, Clock,
  Menu, X, User, Search, Settings, LogOut, Flame,
  Sun, Moon, Monitor, Plus, Briefcase, Languages, ScanSearch,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';
import Logo from '../Logo';
import { changeTheme, changeAccent } from '../ThemeInit';

const TABS = [
  { label: 'Home', icon: Home, href: ROUTES.DASHBOARD },
  { label: 'Mentor', icon: Bot, href: ROUTES.MENTOR },
  { label: 'Resume', icon: FileText, href: ROUTES.RESUME },
  { label: 'Career', icon: Compass, href: ROUTES.CAREER },
  { label: 'History', icon: Clock, href: ROUTES.HISTORY },
];

const THEME_OPTIONS = [
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'system', icon: Monitor, label: 'System' },
];

const ACCENTS = ['emerald', 'blue', 'purple', 'orange', 'red', 'pink', 'cyan'] as const;

function getActiveTab(pathname: string): number {
  if (pathname.startsWith('/mentor')) return 1;
  if (pathname.startsWith('/resume')) return 2;
  if (pathname.startsWith('/career')) return 3;
  if (pathname.startsWith('/history')) return 4;
  return 0;
}

function DrawerOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-40"
      style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    />
  );
}

function DrawerPanel({
  isOpen, onClose,
}: {
  isOpen: boolean; onClose: () => void;
}) {
  const { user, isAuthenticated, isGuest, logout, loginAsGuest } = useAuth();
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [currentAccent, setCurrentAccent] = useState('emerald');
  const [streak] = useState(() => Math.floor(Math.random() * 8) + 3);
  const currentPath = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const x = useMotionValue(0);


  useEffect(() => {
    try {
      const t = localStorage.getItem('vidyguide_theme') || 'dark';
      const a = localStorage.getItem('vidyguide_accent') || 'emerald';
      setCurrentTheme(t);
      setCurrentAccent(a);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleThemeChange = (t: string) => {
    setCurrentTheme(t);
    changeTheme(t);
  };

  const handleAccentChange = (a: string) => {
    setCurrentAccent(a);
    changeAccent(a);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx < 0) x.set(dx);
  };

  const handleTouchEnd = () => {
    if (x.get() < -60) onClose();
    x.set(0);
  };

  const navItems = [
    { icon: Home, label: 'Home', href: ROUTES.DASHBOARD },
    { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.DASHBOARD },
    { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR },
    { icon: FileText, label: 'Resume', href: ROUTES.RESUME },
    { icon: Compass, label: 'Career', href: ROUTES.CAREER },
    { icon: Clock, label: 'History', href: ROUTES.HISTORY },
  ];

  return (
    <motion.aside
      ref={drawerRef}
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden"
      style={{ x, width: 280, maxWidth: '85vw', backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Logo size={22} showText />
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Profile */}
      {isAuthenticated && user ? (
        <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}>
            {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.fullName || user.username}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(250,204,21,0.15)', color: '#facc15' }}>Free</span>
              <Flame size={10} style={{ color: 'var(--accent)' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{streak} day streak</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              <User size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Guest</div>
              <button onClick={() => { onClose(); router.push(ROUTES.AUTH); }}
                className="text-[11px] font-medium underline" style={{ color: 'var(--accent)' }}>
                Sign in to save progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <button
        onClick={() => { onClose(); }}
        className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
      >
        <Search size={14} />
        <span>Search pages & commands</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Ctrl+K</span>
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-2 scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => { onClose(); router.push(item.href); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5"
            style={{
              backgroundColor: currentPath.startsWith(item.href) ? 'var(--accent-10)' : 'transparent',
              color: currentPath.startsWith(item.href) ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Theme & Accent */}
      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-1 mb-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentTheme === opt.id;
            return (
              <button key={opt.id} onClick={() => handleThemeChange(opt.id)}
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
            <button key={a} onClick={() => handleAccentChange(a)}
              className="w-5 h-5 rounded-full transition-transform active:scale-75"
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

      {/* Footer */}
      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button onClick={() => { onClose(); router.push(ROUTES.SETTINGS); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--text-secondary)' }}>
          <Settings size={18} /> Settings
        </button>
        {isAuthenticated ? (
          <button onClick={() => { onClose(); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut size={18} /> Log out
          </button>
        ) : (
          <button onClick={() => { onClose(); router.push(ROUTES.AUTH); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--accent)' }}>
            <User size={18} /> Sign in / Register
          </button>
        )}
      </div>
    </motion.aside>
  );
}

function FloatingActionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Bot, label: 'New Chat', href: ROUTES.MENTOR, desc: 'Talk to your AI mentor' },
    { icon: FileText, label: 'Resume Builder', href: ROUTES.RESUME_BUILDER, desc: 'Build or edit resume' },
    { icon: Compass, label: 'Career Roadmap', href: ROUTES.CAREER, desc: 'Explore career paths' },
    { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, desc: 'Practice interviews' },
    { icon: ScanSearch, label: 'OCR Scanner', href: ROUTES.OCR, desc: 'Scan documents' },
    { icon: Languages, label: 'Translator', href: ROUTES.TRANSLATOR, desc: 'Translate text' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 48, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed bottom-24 right-4 z-40 w-56 overflow-hidden rounded-2xl shadow-2xl"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quick Actions</div>
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { setIsOpen(false); router.push(action.href); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <action.icon size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="text-left">
                    <div>{action.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{action.desc}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90"
        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={22} />
        </motion.div>
      </button>
    </>
  );
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeTab = getActiveTab(pathname);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const canShowShell = isAuthenticated || isGuest;
  if (!canShowShell) return <>{children}</>;

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'G';

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top App Bar */}
      <header className="flex items-center justify-between h-12 px-3 shrink-0 z-20" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            className="p-1.5 -ml-1 rounded-lg transition-all active:scale-90"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Logo size={18} showText textSize="text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(ROUTES.PROFILE)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all active:scale-90"
            style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}
            aria-label="Profile"
          >
            {initial}
          </button>
        </div>
      </header>

      {/* Sticky Tab Bar */}
      <div className="shrink-0 z-10" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div ref={scrollRef} className="flex overflow-x-auto scrollbar-thin gap-1 px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => router.push(tab.href)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all relative"
              style={{
                color: activeTab === i ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto safe-area-bottom">
        {children}
      </main>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <DrawerOverlay onClose={closeDrawer} />
            <DrawerPanel isOpen={drawerOpen} onClose={closeDrawer} />
          </>
        )}
      </AnimatePresence>

      {/* FAB */}
      <FloatingActionButton />
    </div>
  );
}
