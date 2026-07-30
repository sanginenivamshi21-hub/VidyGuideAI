'use client';

import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import MobileShell from './mobile/MobileShell';
import SoftAurora from './SoftAuroraWrapper';
import { ToastProvider } from './Toast';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="hidden lg:flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto relative flex flex-col safe-area-bottom">
          <SoftAurora speed={0.4} scale={1.2} brightness={0.8} />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 z-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <div className="lg:hidden">
        <MobileShell>{children}</MobileShell>
      </div>
    </ToastProvider>
  );
}
