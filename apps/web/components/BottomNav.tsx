'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, ScanSearch, Bot, User, Compass, Briefcase, Languages } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: ROUTES.HOME },
  { icon: Compass, label: 'Career', href: ROUTES.CAREER },
  { icon: FileText, label: 'Resume', href: ROUTES.RESUME_BUILDER },
  { icon: ScanSearch, label: 'Review', href: ROUTES.RESUME_REVIEW },
  { icon: Bot, label: 'Mentor', href: ROUTES.MENTOR },
  { icon: Briefcase, label: 'Interview', href: ROUTES.INTERVIEW_PREP },
  { icon: Languages, label: 'Translate', href: ROUTES.TRANSLATOR },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 lg:hidden safe-area-bottom" role="navigation" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-0 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">{item.label}</span>
              {isActive && <span className="absolute bottom-0.5 w-6 h-0.5 bg-emerald-500 rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
