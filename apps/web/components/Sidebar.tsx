'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Map,
  FileText,
  FileEdit,
  ScanLine,
  Bot,
  Mic,
  Languages,
  Briefcase,
  Clock,
  User,
  Settings,
  LogOut,
  LogIn,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  color: string;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: 'text-blue-400' },
    { icon: Compass, label: 'Career Guidance', href: '/career', color: 'text-emerald-400' },
    { icon: Map, label: 'Career Roadmap', href: '/career/roadmap', color: 'text-purple-400' },
    { icon: FileText, label: 'Resume Builder', href: '/resume', color: 'text-indigo-400' },
    { icon: FileEdit, label: 'Resume Feedback', href: '/resume/feedback', color: 'text-pink-400' },
    { icon: ScanLine, label: 'Resume Scanner (OCR)', href: '/ocr', color: 'text-amber-400' },
    { icon: Bot, label: 'AI Mentor', href: '/mentor', color: 'text-cyan-400' },
    { icon: Mic, label: 'Voice Mentor', href: '/voice-mentor', color: 'text-red-400' },
    { icon: Languages, label: 'Translator', href: '/translator', color: 'text-orange-400' },
    { icon: Briefcase, label: 'Interview Prep', href: '/interview-prep', color: 'text-violet-400' },
    { icon: Clock, label: 'History', href: '/history', color: 'text-teal-400' },
    { icon: User, label: 'Profile', href: '/profile', color: 'text-yellow-400' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-slate-400' },
  ];

  const handleLogout = async () => {
    // Clear cookies & local storage
    try {
      await fetch('http://localhost:8000/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('user');

  return (
    <motion.div
      animate={{ width: isOpen ? 250 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between p-4 relative select-none shrink-0"
    >
      <div className="flex flex-col gap-6 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Header Title / Logo */}
        <div className="flex items-center justify-between h-10 px-2">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <span className="text-xl">🌿</span>
              <h1 className="text-md font-bold text-emerald-400 tracking-wider">
                VidyGuideAI
              </h1>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded bg-emerald-500 mx-auto flex items-center justify-center cursor-pointer" onClick={() => router.push('/')}>
              <span className="text-sm">🌿</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 absolute -right-3 top-5 border border-slate-700 z-50 transition-all duration-200"
          >
            {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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

      {/* Footer metadata & Auth control */}
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
            VidyGuideAI v3.0.0
          </div>
        )}
      </div>
    </motion.div>
  );
}
