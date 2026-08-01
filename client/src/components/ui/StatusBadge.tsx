import { cn } from '@/lib/utils';
import type { BookingStatus, PaymentStatus } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-success/10 text-success border-success/20',
  VERIFIED: 'bg-success/10 text-success border-success/20',
  AWAITING_VERIFICATION: 'bg-warning/10 text-warning border-warning/20',
  SUBMITTED: 'bg-warning/10 text-warning border-warning/20',
  PENDING_PAYMENT: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300',
  PENDING: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  CANCELLED: 'bg-danger/10 text-danger border-danger/20',
  REJECTED: 'bg-danger/10 text-danger border-danger/20',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  AWAITING_VERIFICATION: 'Awaiting verification',
  PENDING_PAYMENT: 'Payment pending',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  VERIFIED: 'Verified',
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus | PaymentStatus | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[status] ?? STATUS_STYLES.PENDING,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
