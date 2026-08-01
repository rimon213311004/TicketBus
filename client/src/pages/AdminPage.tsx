import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Inbox, RefreshCw, Wallet, Clock, Hash, BusFront, Ticket, TrendingUp, Radio, ShieldCheck, MapPin, Navigation, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminStats, fetchPendingPayments, verifyPayment, rejectPayment } from '@/services';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBdt, formatDate, formatDateTime } from '@/utils/format';
import { PAYMENT_METHOD_LABELS } from '@/constants';
import { apiErrorMessage } from '@/lib/api';
import { fadeUp, stagger } from '@/animations/variants';
import type { AdminStats, PendingPayment } from '@/types';

const QUEUE_KEY = ['admin', 'pending-payments'];

export function AdminPage() {
  const queryClient = useQueryClient();
  /** Payment id whose reject form is open, plus the reason being typed. */
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [activePanel, setActivePanel] = useState<'operations' | 'verification'>('operations');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const { data: payments, isLoading, isFetching, refetch } = useQuery({
    queryKey: QUEUE_KEY,
    queryFn: fetchPendingPayments,
  });
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    refetchInterval: 30_000,
  });

  function closeReject() {
    setRejecting(null);
    setReason('');
  }

  const verify = useMutation({
    mutationFn: (paymentId: string) => verifyPayment(paymentId),
    onSuccess: (booking) => {
      toast.success(`Payment verified — ${booking.bookingCode} confirmed`);
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not verify that payment')),
  });

  const reject = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      rejectPayment(paymentId, reason),
    onSuccess: () => {
      toast.success('Payment rejected — the customer can resubmit');
      closeReject();
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not reject that payment')),
  });

  const pendingTotal = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Admin dashboard</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Review submitted payments and issue tickets.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => { refetch(); refetchStats(); }} loading={isFetching || statsLoading}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      {!statsLoading && stats && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={TrendingUp} label="Verified sales" value={`৳${formatBdt(stats.totalSales)}`} tone="success" />
          <Metric icon={Ticket} label="Tickets sold" value={stats.totalTickets.toLocaleString()} tone="brand" />
          <Metric icon={BusFront} label="Buses in service" value={`${stats.activeBuses} / ${stats.totalBuses}`} tone="sky" />
          <Metric icon={Radio} label="Buses on trip now" value={stats.activeTrips.toString()} tone="warning" />
        </div>
      )}

      {!statsLoading && stats && (
        <section className="card mt-5 overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-line p-3 dark:border-line-dark">
            <PanelTab active={activePanel === 'operations'} onClick={() => setActivePanel('operations')} icon={Radio}>
              Live Operations <span className="ml-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px]">{stats.activeTrips}</span>
            </PanelTab>
            <PanelTab active={activePanel === 'verification'} onClick={() => setActivePanel('verification')} icon={ShieldCheck}>
              Payment Verification <span className="ml-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px]">{payments?.length ?? 0}</span>
            </PanelTab>
          </div>
          {activePanel === 'operations' ? <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 dark:border-line-dark">
            <div>
              <h2 className="font-display text-lg font-bold">Live operations</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {stats.todayTrips} departures scheduled today · {stats.activeTrips} currently on the road
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live</span>
          </div>
          {stats.trips.length > 0 ? (
            <div className="grid gap-3 bg-slate-50/70 p-3 dark:bg-slate-950/20 md:grid-cols-2">
              {stats.trips.map((trip) => (
                <button type="button" key={trip._id} onClick={() => setSelectedTripId(trip._id)} className="group relative overflow-hidden rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift dark:border-line-dark dark:bg-card-dark">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-success to-sky" aria-hidden />
                  <div className="mb-4 h-36 overflow-hidden rounded-xl bg-slate-100 pl-2 dark:bg-slate-800">
                    {trip.bus.images?.[0] ? <img src={trip.bus.images[0]} alt={`${trip.bus.name} coach`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-slate-400"><BusFront className="h-10 w-10" aria-hidden /></div>}
                  </div>
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{trip.operator.name}</p>
                      <div className="mt-2 flex items-center gap-2 font-display text-lg font-bold">
                        <span>{trip.route.from}</span><span className="text-brand-500">→</span><span>{trip.route.to}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Trip {trip.code}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${trip.status === 'ON_TRIP' ? 'bg-success/10 text-success' : trip.status === 'BOARDING' ? 'bg-warning/10 text-warning' : 'bg-sky/10 text-sky'}`}>{trip.status === 'ON_TRIP' ? 'On trip' : trip.status === 'BOARDING' ? 'Boarding' : 'Ready'}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3 border-t border-line pt-3 pl-2 dark:border-line-dark">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{trip.bus.name}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-slate-400">{trip.bus.registrationNumber}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{trip.busType}</span><span className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-medium text-brand-700 dark:bg-brand-900/25 dark:text-brand-300">{trip.acType}</span></div>
                    </div>
                    <div className="text-right"><p className="font-display text-base font-bold">{trip.departureLabel}</p><p className="my-0.5 text-[10px] uppercase tracking-wider text-slate-400">arrives</p><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{trip.arrivalLabel}</p></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 pl-2 text-xs dark:border-line-dark"><span className="flex min-w-0 items-center gap-1.5 truncate text-slate-500 dark:text-slate-400"><MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />{trip.location}</span><span className="flex shrink-0 items-center gap-1 font-semibold text-brand-600">Details <ChevronRight className="h-3.5 w-3.5" aria-hidden /></span></div>
                  <div className="mt-2 ml-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-success to-sky" style={{ width: `${trip.progress}%` }} /></div>
                </button>
              ))}
            </div>
          ) : <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No buses are currently boarding or travelling.</p>}
          {selectedTripId && stats.trips.find((trip) => trip._id === selectedTripId) && <TripDetails trip={stats.trips.find((trip) => trip._id === selectedTripId)!} onClose={() => setSelectedTripId(null)} />}
          </> : <div className="p-5"><VerificationIntro count={payments?.length ?? 0} /></div>}
        </section>
      )}

      {!isLoading && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="font-display text-2xl font-bold">{payments?.length ?? 0}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Awaiting verification</div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/25 dark:text-brand-300">
              <Wallet className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="font-display text-2xl font-bold">৳{formatBdt(pendingTotal)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Value in the queue</div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-7 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card space-y-3 p-5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && payments?.length === 0 && (
        <div className="card mt-7 p-14 text-center">
          <Inbox className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Queue is clear</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No payments are waiting for verification right now.
          </p>
        </div>
      )}

      <motion.div variants={stagger} initial="hidden" animate="visible" className={`mt-5 space-y-4 ${activePanel === 'verification' ? '' : 'hidden'}`}>
        {payments?.map((payment) => (
          <PaymentRow
            key={payment._id}
            payment={payment}
            isRejecting={rejecting === payment._id}
            reason={reason}
            onReasonChange={setReason}
            onOpenReject={() => {
              setRejecting(payment._id);
              setReason('');
            }}
            onCancelReject={closeReject}
            onVerify={() => verify.mutate(payment._id)}
            onConfirmReject={() => reject.mutate({ paymentId: payment._id, reason })}
            verifying={verify.isPending && verify.variables === payment._id}
            rejectPending={reject.isPending && reject.variables?.paymentId === payment._id}
          />
        ))}
      </motion.div>
    </div>
  );
}

function PanelTab({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Radio; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? 'bg-ink text-white shadow-sm dark:bg-white dark:text-ink' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" aria-hidden />{children}</button>;
}

function VerificationIntro({ count }: { count: number }) {
  return <div className="rounded-xl border border-warning/20 bg-warning/5 p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/10 text-warning"><ShieldCheck className="h-5 w-5" aria-hidden /></span><div><h3 className="font-display font-bold">Payment verification queue</h3><p className="text-sm text-slate-500 dark:text-slate-400">{count ? `${count} transaction${count === 1 ? '' : 's'} waiting for review below.` : 'No transactions are waiting for review.'}</p></div></div></div>;
}

function TripDetails({ trip, onClose }: { trip: AdminStats['trips'][number]; onClose: () => void }) {
  return <div className="border-t border-line bg-slate-50 p-5 dark:border-line-dark dark:bg-slate-950/30"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected trip</p><h3 className="mt-1 font-display text-xl font-bold">{trip.route.from} <span className="text-brand-500">→</span> {trip.route.to}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trip.location} · Estimated schedule position</p></div><button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-ink">Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-white p-4 dark:bg-card-dark"><p className="text-xs text-slate-400">Progress</p><p className="mt-1 font-display text-2xl font-bold">{trip.progress}%</p></div><div className="rounded-xl bg-white p-4 dark:bg-card-dark"><p className="text-xs text-slate-400">Boarding starts</p><p className="mt-1 font-semibold">{new Date(trip.boardingAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div><div className="rounded-xl bg-white p-4 dark:bg-card-dark"><p className="text-xs text-slate-400">Coordinates</p><p className="mt-1 font-mono text-xs">{trip.boardingPoints[0] ? `${trip.boardingPoints[0].lat}, ${trip.boardingPoints[0].lng}` : 'Route estimate only'}</p></div></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Boarding points</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{trip.boardingPoints.map((point) => <div key={point._id} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm dark:bg-card-dark"><Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden /><div><p className="font-semibold">{point.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{point.city} · {point.minutesBeforeDeparture ?? 20} min before departure</p></div></div>)}</div></div></div>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Wallet; label: string; value: string; tone: 'success' | 'brand' | 'sky' | 'warning' }) {
  const styles = { success: 'bg-success/10 text-success', brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/25 dark:text-brand-300', sky: 'bg-sky/10 text-sky', warning: 'bg-warning/10 text-warning' };
  return <div className="card flex items-center gap-4 p-5"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${styles[tone]}`}><Icon className="h-5 w-5" aria-hidden /></span><div><div className="font-display text-2xl font-bold">{value}</div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div></div></div>;
}

function PaymentRow({
  payment,
  isRejecting,
  reason,
  onReasonChange,
  onOpenReject,
  onCancelReject,
  onVerify,
  onConfirmReject,
  verifying,
  rejectPending,
}: {
  payment: PendingPayment;
  isRejecting: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onOpenReject: () => void;
  onCancelReject: () => void;
  onVerify: () => void;
  onConfirmReject: () => void;
  verifying: boolean;
  rejectPending: boolean;
}) {
  const { booking, user } = payment;
  // The server requires at least 3 characters of explanation.
  const reasonTooShort = reason.trim().length < 3;

  return (
    <motion.article variants={fadeUp} className="card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-lg font-bold">
              {booking?.bookingCode ?? 'Booking removed'}
            </h2>
            <StatusBadge status={payment.status} />
            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-line-dark dark:text-slate-300">
              {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
            </span>
          </div>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {user ? `${user.name} · ${user.phone}` : 'Customer removed'}
            {user?.email ? ` · ${user.email}` : ''}
          </p>

          {booking && (
            <p className="mt-1 text-xs text-slate-400">
              Seats {booking.seatNumbers.join(', ')} · Journey {formatDate(booking.journeyDate)}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="font-display text-xl font-bold text-brand-600">
            ৳{formatBdt(payment.amount)}
          </div>
          {booking && payment.amount !== booking.payableAmount && (
            <div className="mt-0.5 text-xs font-medium text-danger">
              Booking total ৳{formatBdt(booking.payableAmount)}
            </div>
          )}
          {payment.submittedAt && (
            <div className="mt-0.5 text-xs text-slate-400">
              {formatDateTime(payment.submittedAt)}
            </div>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <dt className="sr-only">Transaction ID</dt>
          <dd className="font-mono font-medium">{payment.trxId ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Sent from</dt>
          <dd className="font-medium">{payment.senderNumber ?? '—'}</dd>
        </div>
        {payment.bankName && (
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Bank</dt>
            <dd className="font-medium">{payment.bankName}</dd>
          </div>
        )}
        {payment.bankAccountName && (
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Account name</dt>
            <dd className="font-medium">{payment.bankAccountName}</dd>
          </div>
        )}
      </dl>

      {isRejecting ? (
        <div className="mt-4 rounded-xl border border-danger/25 bg-danger/5 p-4">
          <label htmlFor={`reason-${payment._id}`} className="label">
            Why is this being rejected?
          </label>
          <input
            id={`reason-${payment._id}`}
            className="input"
            autoFocus
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g. No matching transaction found for this TrxID"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            The customer sees this message and can submit a new payment.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              variant="danger"
              onClick={onConfirmReject}
              disabled={reasonTooShort}
              loading={rejectPending}
            >
              Confirm rejection
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelReject}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line pt-4 dark:border-line-dark">
          <Button size="sm" variant="success" onClick={onVerify} loading={verifying}>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Verify &amp; issue ticket
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            onClick={onOpenReject}
          >
            <XCircle className="h-4 w-4" aria-hidden />
            Reject
          </Button>
        </div>
      )}
    </motion.article>
  );
}
