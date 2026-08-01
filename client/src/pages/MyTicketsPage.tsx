import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, Ticket, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyBookings, downloadTicket, cancelBooking } from '@/services';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BusCardSkeleton } from '@/components/ui/Skeleton';
import { formatBdt, formatDate } from '@/utils/format';
import { apiErrorMessage } from '@/lib/api';
import { fadeUp, stagger } from '@/animations/variants';

export function MyTicketsPage() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  });

  const cancel = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId, 'Cancelled by customer'),
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not cancel that booking')),
  });

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-display text-2xl font-bold md:text-3xl">My tickets</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Every booking you have made, with its current status.
      </p>

      {isLoading && (
        <div className="mt-7 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <BusCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && bookings?.length === 0 && (
        <div className="card mt-7 p-14 text-center">
          <Ticket className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No bookings yet</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Search a route and book your first ticket.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/search">Find a bus</Link>
          </Button>
        </div>
      )}

      <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-7 space-y-4">
        {bookings?.map((booking) => {
          const canCancel = booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED';
          const needsPayment = booking.status === 'PENDING_PAYMENT';

          return (
            <motion.article key={booking._id} variants={fadeUp} className="card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-lg font-bold">{booking.operator.name}</h2>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    {booking.route.from} → {booking.route.to} · {formatDate(booking.journeyDate)} ·{' '}
                    {booking.trip.departureLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {booking.bookingCode} · Seats {booking.seatNumbers.join(', ')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-display text-xl font-bold text-brand-600">
                    ৳{formatBdt(booking.payableAmount)}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {booking.paymentMethod.toUpperCase()}
                  </div>
                </div>
              </div>

              {booking.payment?.status === 'REJECTED' && booking.payment.rejectionReason && (
                <div className="mt-4 rounded-xl border border-danger/25 bg-danger/10 p-3.5 text-sm text-danger">
                  Payment rejected: {booking.payment.rejectionReason}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line pt-4 dark:border-line-dark">
                {needsPayment && (
                  <Button size="sm" asChild>
                    <Link to={`/bookings/${booking._id}/payment`}>
                      <CreditCard className="h-4 w-4" aria-hidden />
                      Complete payment
                    </Link>
                  </Button>
                )}

                {booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadTicket(booking._id, booking.bookingCode)}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    {booking.status === 'CONFIRMED' ? 'E-ticket' : 'Voucher'}
                  </Button>
                )}

                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/bookings/${booking._id}/success`}>Details</Link>
                </Button>

                {canCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-danger hover:bg-danger/10"
                    onClick={() => cancel.mutate(booking._id)}
                    loading={cancel.isPending && cancel.variables === booking._id}
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    Cancel
                  </Button>
                )}
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
