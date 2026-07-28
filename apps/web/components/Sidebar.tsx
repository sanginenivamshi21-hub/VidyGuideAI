'use client';

import { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
  requiresAuth?: boolean;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('vidyguide_sidebar') !== 'collapsed';
  });
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isGuest, logout } = useAuth();

  const allItems: SidebarItem[] = [
    { icon: Home, label: 'Home', href: ROUTES.HOME, color: 'text-sky-400' },
    { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.DASHBOARD, color: 'text-blue-400', requiresAuth: true },
    { icon: Compass, label: 'Career Guidance', href: ROUTES.CAREER, color: 'text-emerald-400' },
    { icon: FileText, label: 'Resume Builder', href: ROUTES.RESUME_BUILDER, color: 'text-indigo-400' },
    { icon: ScanSearch, label: 'Resume Review', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
    { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR, color: 'text-cyan-400' },
    { icon: Languages, label: 'Translator', href: ROUTES.TRANSLATOR, color: 'text-orange-400' },
    { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
    { icon: Clock, label: 'History', href: ROUTES.HISTORY, color: 'text-teal-400', requiresAuth: true },
    { icon: User, label: 'Profile', href: ROUTES.PROFILE, color: 'text-yellow-400', requiresAuth: true },
    { icon: Settings, label: 'Settings', href: ROUTES.SETTINGS, color: 'text-slate-400', requiresAuth: true },
  ];

  const menuItems = isAuthenticated ? allItems : allItems.filter(item => !item.requiresAuth);

  return (
    <motion.div
      animate={{ width: isOpen ? 250 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between p-4 relative select-none shrink-0 hidden lg:flex"
    >
      <div className="flex flex-col gap-6 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-center justify-between h-10 px-2">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push(ROUTES.HOME)}
            >
              <span className="text-xl">🌿</span>
              <h1 className="text-md font-bold text-emerald-400 tracking-wider">
                VidyGuideAI
              </h1>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded bg-emerald-500 mx-auto flex items-center justify-center cursor-pointer" onClick={() => router.push(ROUTES.HOME)}>
              <span className="text-sm">🌿</span>
            </div>
          )}
            <button
              onClick={() => {
                const next = !isOpen;
                setIsOpen(next);
                localStorage.setItem('vidyguide_sidebar', next ? 'expanded' : 'collapsed');
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 absolute -right-3 top-5 border border-slate-700 z-50 transition-all duration-200"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
            </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-2.5 rounded-lg w-full transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-medium'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-400'}`} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="flex items-center gap-3 p-2.5 rounded-lg w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={18} className="shrink-0 text-slate-500" />
            {isOpen && <span className="text-xs tracking-wide">Log Out</span>}
          </button>
        ) : (
          <>
            <Link
              href={ROUTES.AUTH}
              className="flex items-center gap-3 p-2.5 rounded-lg w-full text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200"
            >
              <LogIn size={18} className="shrink-0 text-slate-500" />
              {isOpen && <span className="text-xs tracking-wide">Sign In</span>}
            </Link>
            <Link
              href={ROUTES.AUTH + '?mode=register'}
              className="flex items-center gap-3 p-2.5 rounded-lg w-full text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200"
            >
              <UserPlus size={18} className="shrink-0 text-slate-500" />
              {isOpen && <span className="text-xs tracking-wide">Register</span>}
            </Link>
          </>
        )}

        {isOpen && (
          <div className="text-[10px] text-slate-600 text-center font-mono">
            VidyGuideAI v3.1.1
          </div>
        )}
      </div>
    </motion.div>
  );
}
