import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-400" size={32} />
      <p className="text-sm text-slate-400 font-medium">Loading...</p>
    </div>
  );
}
