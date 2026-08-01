import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Download, Ticket, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { fetchBooking, downloadTicket } from '@/services';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBookingStore } from '@/store/bookingStore';
import { formatBdt, formatDate, formatDateTime } from '@/utils/format';
import { confetti, fadeUp, stagger } from '@/animations/variants';

export function BookingSuccessPage() {
  const { bookingId = '' } = useParams();
  const reset = useBookingStore((s) => s.reset);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: Boolean(bookingId),
    // The status flips once an admin verifies, so keep this view fresh.
    refetchInterval: (query) =>
      query.state.data?.status === 'AWAITING_VERIFICATION' ? 15_000 : false,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  if (isLoading || !booking) {
    return (
      <div className="container max-w-2xl space-y-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const isCash = booking.paymentMethod === 'cash';

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="container max-w-2xl py-12"
    >
      <motion.div variants={confetti} className="text-center">
        <span
          className={
            isConfirmed
              ? 'inline-grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success'
              : 'inline-grid h-20 w-20 place-items-center rounded-full bg-warning/10 text-warning'
          }
        >
          {isConfirmed ? (
            <CheckCircle2 className="h-10 w-10" aria-hidden />
          ) : (
            <Clock className="h-10 w-10" aria-hidden />
          )}
        </span>
      </motion.div>

      <motion.h1 variants={fadeUp} className="mt-6 text-center font-display text-3xl font-bold">
        {isConfirmed
          ? 'Your ticket is confirmed'
          : isCash
            ? 'Seats reserved for you'
            : 'Payment submitted'}
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-3 text-center text-slate-500 dark:text-slate-400">
        {isConfirmed
          ? 'Download your e-ticket and show the QR code at boarding.'
          : isCash
            ? `Pay ৳${formatBdt(booking.payableAmount)} at the counter to receive your ticket.`
            : 'We are verifying your transaction. Your ticket unlocks as soon as it is confirmed.'}
      </motion.p>

      <motion.div variants={fadeUp} className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-line bg-slate-50 p-5 dark:border-line-dark dark:bg-slate-900/40">
          <div>
            <div className="text-xs text-slate-400">Booking code</div>
            <div className="font-display text-xl font-bold tracking-wide">{booking.bookingCode}</div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-lg font-bold">{booking.operator.name}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {booking.trip.busType} · {booking.trip.acType}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">{booking.trip.departureLabel}</div>
              <div className="text-slate-500 dark:text-slate-400">
                {formatDate(booking.journeyDate)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/40">
            <MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            <div className="text-sm">
              <div className="font-medium">
                {booking.route.from} → {booking.route.to}
              </div>
              <div className="mt-0.5 text-slate-500 dark:text-slate-400">
                Board at {booking.boardingPoint.name} · Drop at {booking.droppingPoint.name}
              </div>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">Seats</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {booking.seatNumbers.map((seat) => (
                  <span
                    key={seat}
                    className="rounded-lg bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-300"
                  >
                    {seat}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Total paid</dt>
              <dd className="mt-1 font-display text-lg font-bold text-brand-600">
                ৳{formatBdt(booking.payableAmount)}
              </dd>
            </div>
          </dl>

          {booking.payment?.trxId && (
            <div className="mt-5 rounded-xl border border-line p-4 text-sm dark:border-line-dark">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                <span className="font-semibold">{booking.payment.trxId}</span>
              </div>
              {booking.payment.submittedAt && (
                <div className="mt-2 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                  <span>{formatDateTime(booking.payment.submittedAt)}</span>
                </div>
              )}
            </div>
          )}

          {!isConfirmed && isCash && booking.holdExpiresAt && (
            <div className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
              Seats held until {formatDateTime(booking.holdExpiresAt)}.
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          full
          size="lg"
          onClick={() => downloadTicket(booking._id, booking.bookingCode)}
        >
          <Download className="h-4 w-4" aria-hidden />
          {isConfirmed ? 'Download e-ticket' : 'Download voucher'}
        </Button>
        <Button full size="lg" variant="secondary" asChild>
          <Link to="/my-tickets">
            <Ticket className="h-4 w-4" aria-hidden />
            My tickets
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
