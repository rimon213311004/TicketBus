import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { countdown } from '@/utils/format';
import { cn } from '@/lib/utils';

/** Live mm:ss countdown on the seat hold; warns when under two minutes. */
export function HoldTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(() => countdown(expiresAt));

  useEffect(() => {
    const id = setInterval(() => {
      const next = countdown(expiresAt);
      setRemaining(next);
      if (next === null) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (remaining === null) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
        <Clock className="h-4 w-4" aria-hidden />
        Your seat hold expired. Please select seats again.
      </div>
    );
  }

  const [minutes] = remaining.split(':').map(Number);
  const urgent = minutes < 2;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm',
        urgent
          ? 'border-danger/25 bg-danger/10 text-danger'
          : 'border-warning/25 bg-warning/10 text-warning',
      )}
    >
      <Clock className="h-4 w-4" aria-hidden />
      Seats held for <span className="font-semibold tabular-nums">{remaining}</span>
    </div>
  );
}
