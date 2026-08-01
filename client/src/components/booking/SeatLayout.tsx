import { motion } from 'framer-motion';
import { CircleDot } from 'lucide-react';
import type { Seat } from '@/types';
import { cn } from '@/lib/utils';
import { seatPop } from '@/animations/variants';

interface SeatLayoutProps {
  seats: Seat[];
  columns: number;
  selected: string[];
  onToggle: (seatNumber: string) => void;
  maxSeats: number;
}

/**
 * Seat status is conveyed by label text and aria-label as well as colour, so the
 * map stays usable for colour-blind riders and screen readers.
 */
export function SeatLayout({ seats, columns, selected, onToggle, maxSeats }: SeatLayoutProps) {
  const rows = seats.reduce<Map<number, Seat[]>>((acc, seat) => {
    const list = acc.get(seat.row) ?? [];
    list.push(seat);
    acc.set(seat.row, list);
    return acc;
  }, new Map());

  const aisleAfter = Math.floor(columns / 2);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
        <LegendItem className="border-line bg-white dark:bg-slate-900" label="Available" />
        <LegendItem className="border-brand-600 bg-brand-600 text-white" label="Selected" />
        <LegendItem className="border-warning/40 bg-warning/20 text-warning" label="On hold" />
        <LegendItem className="border-line bg-slate-200 text-slate-400 dark:bg-slate-800" label="Booked" />
      </div>

      <div className="mx-auto w-fit rounded-2xl border border-line bg-slate-50 p-5 dark:border-line-dark dark:bg-slate-900/50">
        <div className="mb-4 flex justify-end border-b border-dashed border-line pb-3 dark:border-line-dark">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CircleDot className="h-4 w-4" aria-hidden />
            Driver
          </span>
        </div>

        <div className="space-y-2.5">
          {[...rows.entries()].map(([rowNumber, rowSeats]) => (
            <div key={rowNumber} className="flex items-center gap-2.5">
              {rowSeats.map((seat) => (
                <div key={seat.seatNumber} className="flex items-center gap-2.5">
                  <SeatButton
                    seat={seat}
                    isSelected={selected.includes(seat.seatNumber)}
                    atLimit={selected.length >= maxSeats}
                    onToggle={onToggle}
                  />
                  {seat.column === aisleAfter && <span className="w-6" aria-hidden />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  isSelected,
  atLimit,
  onToggle,
}: {
  seat: Seat;
  isSelected: boolean;
  atLimit: boolean;
  onToggle: (seatNumber: string) => void;
}) {
  const isBooked = seat.status === 'booked';
  const isHeldByOther = seat.status === 'held' && !seat.heldByMe;
  const disabled = isBooked || isHeldByOther || (atLimit && !isSelected);

  const statusLabel = isBooked
    ? 'already booked'
    : isHeldByOther
      ? 'on hold by another traveller'
      : isSelected
        ? 'selected'
        : 'available';

  return (
    <motion.button
      type="button"
      {...(disabled ? {} : seatPop)}
      onClick={() => !disabled && onToggle(seat.seatNumber)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.seatNumber}, ${statusLabel}`}
      className={cn(
        'h-11 w-11 rounded-xl border-2 text-xs font-semibold transition',
        isSelected && 'border-brand-600 bg-brand-600 text-white shadow-glow',
        !isSelected && seat.status === 'available' && 'border-line bg-white text-slate-600 hover:border-brand-400 dark:bg-slate-900 dark:text-slate-300',
        isHeldByOther && 'cursor-not-allowed border-warning/40 bg-warning/20 text-warning',
        isBooked && 'cursor-not-allowed border-line bg-slate-200 text-slate-400 line-through dark:bg-slate-800',
        atLimit && !isSelected && seat.status === 'available' && 'cursor-not-allowed opacity-50',
      )}
    >
      {seat.seatNumber}
    </motion.button>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('h-5 w-5 rounded-md border-2', className)} aria-hidden />
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </span>
  );
}
