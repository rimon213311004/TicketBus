/** Formats a BDT amount for display, e.g. 2,440. */
export function formatBdt(amount: number): string {
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(value: string | Date, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: style === 'long' ? 'full' : 'medium',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(value));
}

/** YYYY-MM-DD in local time, for date inputs and API params. */
export function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** mm:ss remaining until the given time, or null once it passes. */
export function countdown(expiresAt: string | Date): string | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
