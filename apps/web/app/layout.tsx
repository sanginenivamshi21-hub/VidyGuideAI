import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import SoftAurora from '../components/SoftAurora';
import ThemeInit from '../components/ThemeInit';
import { AuthProvider } from '../hooks/useAuth';

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
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-200 flex overflow-hidden`}>
        <ThemeInit />
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
            <SoftAurora speed={0.4} scale={1.2} brightness={0.8} />
            <div className="flex-1 p-8 z-10">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
