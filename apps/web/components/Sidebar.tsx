'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Compass,
  FileText,
  ScanSearch,
  Bot,
  Languages,
  Briefcase,
  Clock,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Home,
  LogIn,
  UserPlus,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';
import { ROUTES } from '@/lib/routes';

interface SidebarItem {
  icon: LucideIcon;
  labelKey: string;
  href: string;
  color: string;
  requiresAuth?: boolean;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    setIsOpen(localStorage.getItem('vidyguide_sidebar') !== 'collapsed');
    setMounted(true);
  }, []);

  const { isAuthenticated, isGuest, logout } = useAuth();

  const allItems: SidebarItem[] = [
    { icon: Home, labelKey: 'nav.home', href: ROUTES.HOME, color: 'text-sky-400' },
    { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: ROUTES.DASHBOARD, color: 'text-blue-400', requiresAuth: true },
    { icon: Compass, labelKey: 'nav.career', href: ROUTES.CAREER, color: 'text-emerald-400' },
    { icon: FileText, labelKey: 'nav.resumeBuilder', href: ROUTES.RESUME_BUILDER, color: 'text-indigo-400' },
    { icon: ScanSearch, labelKey: 'nav.resumeReview', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
    { icon: Bot, labelKey: 'nav.aiMentor', href: ROUTES.MENTOR, color: 'text-cyan-400' },
    { icon: Languages, labelKey: 'nav.translator', href: ROUTES.TRANSLATOR, color: 'text-orange-400' },
    { icon: Briefcase, labelKey: 'nav.interviewPrep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
    { icon: Clock, labelKey: 'nav.history', href: ROUTES.HISTORY, color: 'text-teal-400', requiresAuth: true },
    { icon: User, labelKey: 'nav.profile', href: ROUTES.PROFILE, color: 'text-yellow-400', requiresAuth: true },
    { icon: Settings, labelKey: 'nav.settings', href: ROUTES.SETTINGS, color: 'text-slate-400', requiresAuth: true },
  ];

  const menuItems = useMemo(
    () => (mounted && isAuthenticated ? allItems : allItems.filter(item => !item.requiresAuth)),
    [mounted, isAuthenticated],
  );

  return (
    <motion.nav
      animate={{ width: isOpen ? 252 : 72 }}
      transition={animationsEnabled ? { duration: 0.25, ease: [0.32, 0.72, 0, 1] } : { duration: 0 }}
      className="h-screen border-r shrink-0 hidden lg:flex flex-col justify-between p-4 relative select-none"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
      aria-label={t('nav.main')}
    >
      <div className="flex flex-col gap-6 overflow-y-auto pr-1 scrollbar-thin">
        <div className="flex items-center justify-between h-10 px-2">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
            aria-label={t('nav.home')}
          >
            {isOpen ? (
              <motion.div
                initial={animationsEnabled ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Logo size={28} />
                <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--accent)' }}>VidyGuideAI</span>
              </motion.div>
            ) : (
              <Logo size={28} />
            )}
          </button>
          <button
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              localStorage.setItem('vidyguide_sidebar', next ? 'expanded' : 'collapsed');
            }}
            className="p-1.5 rounded-lg absolute -right-3 top-5 z-50 transition-all duration-200"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft size={15} /> : <Menu size={15} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isOpen ? undefined : label}
                className="relative flex items-center gap-3 p-2.5 rounded-lg w-full transition-colors duration-150 group"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                    transition={animationsEnabled ? { type: 'spring', damping: 30, stiffness: 350 } : { duration: 0 }}
                  />
                )}
                <Icon size={18} className={`shrink-0 ${isActive ? item.color : ''}`} style={isActive ? {} : { color: 'var(--text-muted)' }} />
                {isOpen && (
                  <motion.span
                    initial={animationsEnabled ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    className="text-xs tracking-wide whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
        {mounted && isAuthenticated ? (
          <button
            onClick={logout}
            title={isOpen ? undefined : t('nav.logout')}
            className="flex items-center gap-3 p-2.5 rounded-lg w-full transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={18} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            {isOpen && <span className="text-xs tracking-wide">{t('nav.logout')}</span>}
          </button>
        ) : (
          <>
            <Link
              href={ROUTES.AUTH}
              title={isOpen ? undefined : t('nav.signIn')}
              className="flex items-center gap-3 p-2.5 rounded-lg w-full transition-all duration-200"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogIn size={18} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
              {isOpen && <span className="text-xs tracking-wide">{t('nav.signIn')}</span>}
            </Link>
            <Link
              href={ROUTES.AUTH + '?mode=register'}
              title={isOpen ? undefined : t('nav.register')}
              className="flex items-center gap-3 p-2.5 rounded-lg w-full transition-all duration-200"
              style={{ color: 'var(--text-secondary)' }}
            >
              <UserPlus size={18} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
              {isOpen && <span className="text-xs tracking-wide">{t('nav.register')}</span>}
            </Link>
          </>
        )}

        {isOpen && (
          <div className="text-[10px] text-center font-mono" style={{ color: 'var(--text-muted)' }}>
            VidyGuideAI v3.1.1
          </div>
        )}
      </div>
    </motion.nav>
  );
}
