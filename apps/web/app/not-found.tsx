'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Logo size={40} />
      <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--accent-10)' }}>
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
      <p className="text-sm max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          <Home size={14} /> Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    </div>
  );
}
