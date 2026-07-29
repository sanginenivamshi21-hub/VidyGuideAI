'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Compass,
  Briefcase,
  ScanSearch,
  Languages,
  Clock,
  User,
  Settings,
  LogOut,
  Flame,
  HelpCircle,
  Info,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const PRIMARY: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.DASHBOARD, requiresAuth: true },
  { icon: Bot, label: 'AI Mentor', href: ROUTES.MENTOR },
  { icon: FileText, label: 'Resume', href: ROUTES.RESUME },
  { icon: Compass, label: 'Career Guidance', href: ROUTES.CAREER },
  { icon: Briefcase, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP },
  { icon: ScanSearch, label: 'OCR Scanner', href: ROUTES.OCR },
  { icon: Languages, label: 'Translator', href: ROUTES.TRANSLATOR },
  { icon: Clock, label: 'History', href: ROUTES.HISTORY, requiresAuth: true },
];

const SECONDARY: NavItem[] = [
  { icon: User, label: 'Profile', href: ROUTES.PROFILE, requiresAuth: true },
  { icon: Settings, label: 'Settings', href: ROUTES.SETTINGS, requiresAuth: true },
  { icon: HelpCircle, label: 'Help', href: '/help' },
  { icon: Info, label: 'About', href: '/about' },
];

function NavGroup({ items, label, isAuth }: { items: NavItem[]; label?: string; isAuth: boolean }) {
  const pathname = usePathname();
  const visible = isAuth ? items : items.filter((i) => !i.requiresAuth);

  return (
    <div>
      {label && (
        <div className="px-3 py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {label}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const isAuth = isAuthenticated;

  return (
    <aside
      className="w-60 h-screen flex flex-col shrink-0 border-r select-none"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex items-center gap-2.5 px-4 h-12 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Logo size={20} />
        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--accent)' }}>VidyGuideAI</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin space-y-4">
        <NavGroup items={PRIMARY} label="Primary" isAuth={isAuth} />
        <NavGroup items={SECONDARY} label="Secondary" isAuth={isAuth} />
      </nav>

      <div className="px-2 pb-3 space-y-1 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {isAuth ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <Flame size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {Math.floor(Math.random() * 8) + 3} day streak
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-all"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </>
        ) : (
          <Link
            href={ROUTES.AUTH}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: 'var(--accent)' }}
          >
            <User size={16} />
            Sign in
          </Link>
        )}
        <div className="px-3 pt-1">
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>v3.2.0</span>
        </div>
      </div>
    </aside>
  );
}
