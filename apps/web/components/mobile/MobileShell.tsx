'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LayoutDashboard, Bot, Compass, FileText, ScanSearch,
  Briefcase, Languages, Clock, User, Settings, LogOut,
  Sun, Moon, Monitor, Sparkles, X, ChevronRight, Star, Search,
  SquarePen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

interface DrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { icon: Home, label: 'Home', href: ROUTES.HOME, color: 'text-sky-400' },
      { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.DASHBOARD, color: 'text-blue-400', auth: true },
      { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR, color: 'text-emerald-400' },
      { icon: Compass, label: 'Career Guidance', href: ROUTES.CAREER, color: 'text-emerald-400' },
      { icon: FileText, label: 'Resume Builder', href: ROUTES.RESUME_BUILDER, color: 'text-indigo-400' },
      { icon: ScanSearch, label: 'Resume Review', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
      { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
      { icon: Languages, label: 'Translator', href: ROUTES.TRANSLATOR, color: 'text-orange-400' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Clock, label: 'History', href: ROUTES.HISTORY, color: 'text-teal-400', auth: true },
      { icon: User, label: 'Profile', href: ROUTES.PROFILE, color: 'text-yellow-400', auth: true },
      { icon: Settings, label: 'Settings', href: ROUTES.SETTINGS, color: 'text-slate-400', auth: true },
    ],
  },
];

const THEME_OPTIONS = [
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
];

const MOTION_VARIANTS = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  drawer: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 },
  },
};

function LauncherButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg active:scale-95 transition-transform"
      aria-label="Open navigation"
    >
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <path d="M16 2L28 10V22L16 30L4 22V10L16 2Z" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-10)" />
        <text x="16" y="21" textAnchor="middle" fill="var(--accent)" fontSize="14" fontWeight="800" fontFamily="system-ui">V</text>
      </svg>
      <span className="text-xs font-bold text-white tracking-tight">VidyGuideAI</span>
    </button>
  );
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState('dark');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('vidyguide_theme') || 'dark';
    setCurrentTheme(saved);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('vidyguide_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -80 && isOpen) close();
  };

  const isMentor = pathname === ROUTES.MENTOR;

  const getPageTitle = () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.href === pathname) return item.label;
      }
    }
    if (pathname.startsWith('/career/roadmap')) return 'Career Roadmap';
    if (pathname.startsWith('/resume/builder')) return 'Resume Builder';
    if (pathname.startsWith('/resume/review')) return 'Resume Review';
    if (pathname.startsWith('/auth')) return 'Sign In';
    return 'VidyGuideAI';
  };

  const navigateAndClose = (href: string) => {
    router.push(href);
    close();
  };

  const filteredNav = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => !item.auth || isAuthenticated)
      .filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.label.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  })).filter((group) => group.items.length > 0);

  const useBackdrop = pathname === ROUTES.MENTOR;

  return (
    <DrawerContext.Provider value={{ isOpen, open, close }}>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-950 safe-area-top">
        {/* Header - hide on mentor page since mentor has its own header */}
        {!isMentor && (
          <header className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 shrink-0 bg-slate-950/95 backdrop-blur-lg z-10">
            <LauncherButton onClick={open} />
            <span className="text-xs font-semibold text-slate-400 truncate max-w-[160px]">
              {getPageTitle()}
            </span>
            <div className="w-[72px]" />
          </header>
        )}

        {/* Mentor page gets its own minimal header with just the launcher */}
        {isMentor && (
          <header className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 shrink-0 bg-slate-950/95 backdrop-blur-lg z-10">
            <LauncherButton onClick={open} />
            <span className="text-xs font-bold text-white">AI Mentor</span>
            <button
              onClick={() => navigateAndClose(ROUTES.MENTOR)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
              aria-label="New chat"
            >
              <SquarePen size={16} />
            </button>
          </header>
        )}

        {/* Content area with page transitions */}
        <main className="flex-1 overflow-y-auto relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>

        {/* Drawer overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="drawer-backdrop"
                {...MOTION_VARIANTS.backdrop}
                className={`fixed inset-0 z-40 ${useBackdrop ? 'backdrop-blur-sm bg-black/60' : 'bg-black/50'}`}
                onClick={close}
              />
              <motion.div
                key="drawer-panel"
                ref={drawerRef}
                {...MOTION_VARIANTS.drawer}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] z-50 flex flex-col bg-slate-950 border-r border-slate-800 shadow-2xl"
                style={{ WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)' }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M16 2L28 10V22L16 30L4 22V10L16 2Z" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-10)" />
                      <text x="16" y="21" textAnchor="middle" fill="var(--accent)" fontSize="14" fontWeight="800" fontFamily="system-ui">V</text>
                    </svg>
                    <div>
                      <h2 className="text-sm font-bold text-white">VidyGuideAI</h2>
                      <p className="text-[10px] text-slate-500">AI Career Platform</p>
                    </div>
                  </div>
                  <button
                    onClick={close}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                    aria-label="Close navigation"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Search */}
                <div className="px-3 py-2.5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages..."
                      className="w-full text-xs bg-slate-900 rounded-xl pl-8 pr-3 py-2.5 outline-none border border-slate-800 text-white placeholder:text-slate-500 transition-colors focus:border-slate-700"
                    />
                  </div>
                </div>

                {/* Navigation items */}
                <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
                  {filteredNav.map((group) => (
                    <div key={group.label} className="mb-2">
                      <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 py-1.5">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                          <button
                            key={item.href}
                            onClick={() => navigateAndClose(item.href)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all mb-0.5 ${
                              isActive
                                ? 'text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                            style={isActive ? { backgroundColor: 'var(--accent-10)' } : {}}
                          >
                            <Icon size={17} className={isActive ? item.color : 'text-slate-500'} />
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {isActive && (
                              <ChevronRight size={14} className="text-slate-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer: Theme + Logout */}
                <div className="border-t border-slate-800/50 px-3 py-3 shrink-0">
                  <div className="flex items-center gap-1 mb-3 px-1">
                    {THEME_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = currentTheme === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleThemeChange(opt.value)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          style={isActive ? { backgroundColor: 'var(--accent-10)', color: 'var(--accent)' } : {}}
                        >
                          <Icon size={13} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {isAuthenticated ? (
                    <button
                      onClick={() => { logout(); close(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigateAndClose(ROUTES.AUTH)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                    >
                      <LogOut size={16} />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DrawerContext.Provider>
  );
}
