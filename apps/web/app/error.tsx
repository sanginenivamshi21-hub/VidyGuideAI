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
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <AlertTriangle size={24} />
      </div>
      <h2 className="text-lg font-bold text-white">Something went wrong</h2>
      <p className="text-sm text-slate-400 max-w-md text-center">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}
