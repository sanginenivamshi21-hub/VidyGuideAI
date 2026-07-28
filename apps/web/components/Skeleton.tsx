export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-800/60 rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-slate-800 rounded-2xl animate-pulse bg-slate-900/40">
      <Skeleton className="w-10 h-10 rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="flex gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-800/60 border border-slate-800/80 rounded-2xl p-4 min-w-[80px] flex-1 h-[72px] animate-pulse" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
          <div className={`flex flex-col gap-2 ${i % 2 === 0 ? 'items-end' : ''}`}>
            <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
            <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-32' : 'w-52'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
