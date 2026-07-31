'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LayoutDashboard, Bot, Compass, FileText, ScanSearch,
  Briefcase, Languages, Clock, User, Settings, LogOut,
  Sun, Moon, Monitor, X, ChevronRight, Search,
  SquarePen, Flame, Star, Crown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import Logo from '../Logo';
import { changeTheme, changeAccent } from '../ThemeInit';

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
    labelKey: 'nav.main',
    items: [
      { icon: Home, labelKey: 'nav.home', href: ROUTES.HOME, color: 'text-sky-400' },
      { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: ROUTES.DASHBOARD, color: 'text-blue-400', auth: true },
      { icon: Bot, labelKey: 'nav.aiMentor', href: ROUTES.MENTOR, color: 'text-emerald-400' },
      { icon: Compass, labelKey: 'nav.career', href: ROUTES.CAREER, color: 'text-emerald-400' },
      { icon: FileText, labelKey: 'nav.resumeBuilder', href: ROUTES.RESUME_BUILDER, color: 'text-indigo-400' },
      { icon: ScanSearch, labelKey: 'nav.resumeReview', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
      { icon: Briefcase, labelKey: 'nav.interviewPrep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
      { icon: Languages, labelKey: 'nav.translator', href: ROUTES.TRANSLATOR, color: 'text-orange-400' },
    ],
  },
  {
    labelKey: 'nav.account',
    items: [
      { icon: Clock, labelKey: 'nav.history', href: ROUTES.HISTORY, color: 'text-teal-400', auth: true },
      { icon: User, labelKey: 'nav.profile', href: ROUTES.PROFILE, color: 'text-yellow-400', auth: true },
      { icon: Settings, labelKey: 'nav.settings', href: ROUTES.SETTINGS, color: 'text-slate-400', auth: true },
    ],
  },
];

const THEME_OPTIONS = [
  { value: 'dark', icon: Moon, labelKey: 'settings.themeDark' },
  { value: 'light', icon: Sun, labelKey: 'settings.themeLight' },
  { value: 'system', icon: Monitor, labelKey: 'settings.themeSystem' },
];

function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg active:scale-90 transition-transform bg-transparent border-none outline-none"
      aria-label="Open navigation"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="1.5" rx="0.75" fill="currentColor" style={{ color: 'var(--text-primary)' }} />
        <rect x="2" y="9.25" width="16" height="1.5" rx="0.75" fill="currentColor" style={{ color: 'var(--text-primary)' }} />
        <rect x="2" y="14.5" width="16" height="1.5" rx="0.75" fill="currentColor" style={{ color: 'var(--text-primary)' }} />
      </svg>
      <Logo size={18} mono />
    </button>
  );
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [currentAccent, setCurrentAccent] = useState('emerald');
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, logout, user } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('vidyguide_theme') || 'dark';
    const accent = localStorage.getItem('vidyguide_accent') || 'emerald';
    setCurrentTheme(saved);
    setCurrentAccent(accent);
    try {
      const profile = localStorage.getItem('user');
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed.streak) setStreak(parsed.streak);
      }
    } catch {}
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
    changeTheme(theme);
  };

  const handleAccentChange = (accent: string) => {
    setCurrentAccent(accent);
    changeAccent(accent);
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
        if (item.href === pathname) return t(item.labelKey);
      }
    }
    if (pathname.startsWith('/career/roadmap')) return t('roadmap.title');
    if (pathname.startsWith('/resume/builder')) return t('nav.resumeBuilder');
    if (pathname.startsWith('/resume/review')) return t('nav.resumeReview');
    if (pathname.startsWith('/auth')) return t('auth.title');
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
          t(item.labelKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
          t(group.labelKey).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  })).filter((group) => group.items.length > 0);

  const handleSwipeOpen = (e: React.TouchEvent) => {
    if (isOpen) return;
    const start = touchStartX.current;
    const end = e.changedTouches[0].clientX;
    if (start < 15 && end - start > 60) open();
  };

  const userName = user?.fullName || user?.username || t('nav.guest');
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DrawerContext.Provider value={{ isOpen, open, close }}>
      <div
        className="flex flex-col h-screen overflow-hidden safe-area-top"
        style={{ backgroundColor: 'var(--bg-primary)' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={handleSwipeOpen}
      >
        {!isMentor && (
          <header className="flex items-center justify-between px-3 py-2 shrink-0 z-10" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)' }}>
            <HamburgerButton onClick={open} />
            <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>
              {getPageTitle()}
            </span>
            <div className="w-[72px]" />
          </header>
        )}

        {isMentor && (
          <header className="flex items-center justify-between px-3 py-2 shrink-0 z-10" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)' }}>
            <HamburgerButton onClick={open} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t('nav.aiMentor')}</span>
            <button
              onClick={() => navigateAndClose(ROUTES.MENTOR)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="New chat"
            >
              <SquarePen size={16} />
            </button>
          </header>
        )}

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

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                onClick={close}
              />
              <motion.div
                key="drawer-panel"
                ref={drawerRef}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] z-50 flex flex-col shadow-2xl"
                style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)' }}
              >
                {/* Premium Drawer Header */}
                <div className="shrink-0 px-4 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <Logo size={26} />
                    <button
                      onClick={close}
                      className="p-1.5 rounded-lg transition-colors touch-manipulation"
                      style={{ color: 'var(--text-tertiary)' }}
                      aria-label="Close navigation"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: 'var(--accent-20)', color: 'var(--accent)' }}
                      >
                        {user?.profilePicture ? (
                          <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{userName}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('nav.freePlan')}</div>
                      </div>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: '#fb923c' }}>
                          <Flame size={11} />
                          {streak}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <User size={18} style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('nav.guest')}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('nav.signInToSave')}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-3 pt-3 pb-1.5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.searchPages')}
                      className="w-full text-xs rounded-xl pl-8 pr-3 py-2.5 outline-none border transition-colors"
                      style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
                  {filteredNav.map((group) => (
                    <div key={group.labelKey} className="mb-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5" style={{ color: 'var(--text-muted)' }}>
                        {t(group.labelKey)}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                          <button
                            key={item.href}
                            onClick={() => navigateAndClose(item.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all mb-0.5 active:scale-[0.98]"
                            style={{
                              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                              backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                            }}
                          >
                            <Icon size={17} className={isActive ? item.color : ''} style={{ color: isActive ? undefined : 'var(--text-muted)' }} />
                            <span className="flex-1 text-left truncate">{t(item.labelKey)}</span>
                            {isActive && (
                              <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Theme & Accent + Auth */}
                <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-1 mb-3 px-1">
                    {THEME_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = currentTheme === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleThemeChange(opt.value)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-90"
                          style={{
                            backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                          }}
                        >
                          <Icon size={13} />
                          {t(opt.labelKey)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3 px-1">
                    {['emerald', 'blue', 'purple', 'orange', 'pink', 'cyan'].map((accent) => (
                      <button
                        key={accent}
                        onClick={() => handleAccentChange(accent)}
                        className="w-5 h-5 rounded-full transition-all active:scale-90"
                        style={{
                          backgroundColor: `var(--accent-${accent === currentAccent ? '20' : '10'})`,
                          outline: accent === currentAccent ? '2px solid var(--accent)' : 'none',
                          outlineOffset: '2px',
                        }}
                        aria-label={`${accent} accent`}
                      />
                    ))}
                  </div>

                  {isAuthenticated ? (
                    <button
                      onClick={() => { logout(); close(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all active:scale-[0.98]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogOut size={16} />
                      <span>{t('nav.logout')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigateAndClose(ROUTES.AUTH)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all active:scale-[0.98]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogOut size={16} />
                      <span>{t('nav.signIn')}</span>
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
