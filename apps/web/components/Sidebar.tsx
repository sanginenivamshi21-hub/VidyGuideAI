'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Compass,
  Map,
  FileText,
  FileEdit,
  ScanLine,
  Bot,
  Languages,
  Briefcase,
  Clock,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { ROUTES, SIDEBAR_ITEMS } from '@/lib/routes';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Compass,
  Map,
  FileText,
  FileEdit,
  ScanLine,
  Bot,
  Languages,
  Briefcase,
  Clock,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('vidyguide_sidebar') !== 'collapsed';
  });
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: SidebarItem[] = SIDEBAR_ITEMS.map((item) => ({
    ...item,
    icon: ICON_MAP[item.icon],
  }));

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('user');
    router.push(ROUTES.AUTH);
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('user');

  return (
    <motion.div
      animate={{ width: isOpen ? 250 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between p-4 relative select-none shrink-0"
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
              fetch(`${API_BASE}/settings`, {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sidebarCollapsed: !next }),
              }).catch(() => {});
            }}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 absolute -right-3 top-5 border border-slate-700 z-50 transition-all duration-200"
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
              >
                <Icon size={18} className={`shrink-0 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-350'}`} />
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
        {isOpen ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2.5 rounded-lg w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={18} className="shrink-0 text-slate-500" />
            <span className="text-xs tracking-wide">Log Out</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 flex justify-center"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        )}

        {isOpen && (
          <div className="text-[10px] text-slate-650 text-center font-mono">
            VidyGuideAI v3.1.1
          </div>
        )}
      </div>
    </motion.div>
  );
}
