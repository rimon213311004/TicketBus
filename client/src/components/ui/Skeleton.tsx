import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function BusCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="mt-5 flex gap-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SeatMapSkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
