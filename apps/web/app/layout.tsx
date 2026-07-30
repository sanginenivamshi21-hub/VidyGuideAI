import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeInit from '../components/ThemeInit';
import { AuthProvider } from '../hooks/useAuth';
import AppShell from '../components/AppShell';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vidyguideai.com';

export const metadata: Metadata = {
  title: { default: 'VidyGuideAI - AI Career Platform for Students', template: '%s | VidyGuideAI' },
  description: 'Build ATS-compatible resumes, practice interviews, get personalized career guidance, and chat with an AI mentor — all in one place. In your language.',
  keywords: ['AI career platform', 'resume builder', 'interview prep', 'career guidance', 'ATS resume', 'AI mentor', 'job preparation', 'India careers'],
  openGraph: {
    title: 'VidyGuideAI - AI Career Platform for Students',
    description: 'Build ATS-compatible resumes, practice interviews, get personalized career guidance, and chat with an AI mentor.',
    url: siteUrl,
    siteName: 'VidyGuideAI',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VidyGuideAI - AI Career Platform for Students',
    description: 'Build ATS-compatible resumes, practice interviews, get personalized career guidance, and chat with an AI mentor.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg', apple: '/icon-192.svg' },
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
          __html: `(function(){try{var t=localStorage.getItem('vidyguide_theme')||'dark',a=localStorage.getItem('vidyguide_accent')||'emerald',r=document.documentElement;if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}r.classList.add(t);r.setAttribute('data-accent',a);var n=localStorage.getItem('vidyguide_animations');if(n!==null)r.setAttribute('data-animations',n)}catch(e){}})();`}} />
      </head>
      <body className={`${inter.className} min-h-full`}>
        <ThemeInit />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
