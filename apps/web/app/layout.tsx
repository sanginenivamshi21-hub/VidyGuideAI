import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import ThemeInit from '../components/ThemeInit';
import PageTransition from '../components/PageTransition';
import { AuthProvider } from '../hooks/useAuth';
import { LanguageProvider } from '../lib/i18n';
import { MotionConfig } from 'framer-motion';
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('vidyguide_theme')||'dark',a=localStorage.getItem('vidyguide_accent')||'emerald',l=localStorage.getItem('vidyguide_language')||'en',r=document.documentElement;if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}r.classList.add(t);r.setAttribute('data-accent',a);r.setAttribute('lang',l);var n=localStorage.getItem('vidyguide_animations');if(n!==null)r.setAttribute('data-animations',n)}catch(e){}})();`}}
        />
      </head>
      <body className={`${inter.className} min-h-full`}>
        <ThemeInit />
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <LanguageProvider>
              <div className="hidden lg:flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 h-screen overflow-y-auto relative flex flex-col safe-area-bottom">
                  <SoftAurora speed={0.4} scale={1.2} brightness={0.8} />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 z-10 max-w-7xl mx-auto w-full">
                    <PageTransition>{children}</PageTransition>
                  </div>
                </main>
              </div>

              <div className="lg:hidden">
                <MobileShell>{children}</MobileShell>
              </div>
            </LanguageProvider>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
