'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={24} style={{ color: '#ef4444' }} />
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
      <p className="text-sm max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}
