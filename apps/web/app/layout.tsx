import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import ThemeInit from '../components/ThemeInit';
import { AuthProvider } from '../hooks/useAuth';
import MobileShell from '../components/mobile/MobileShell';
import SoftAurora from '../components/SoftAuroraWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VidyGuideAI - Production SaaS',
  description: 'AI-powered localized career counseling platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-200`}>
        <ThemeInit />
        <AuthProvider>
          {/* Desktop layout */}
          <div className="hidden lg:flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto relative flex flex-col safe-area-bottom">
              <SoftAurora speed={0.4} scale={1.2} brightness={0.8} />
              <div className="flex-1 p-4 sm:p-6 lg:p-8 z-10 max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden">
            <MobileShell>{children}</MobileShell>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
