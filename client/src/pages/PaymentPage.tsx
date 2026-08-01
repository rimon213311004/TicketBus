import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Copy, Check, Smartphone, Banknote, Download, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { fetchBooking, submitPayment, fetchPaymentInstructions, downloadTicket } from '@/services';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBdt, formatDateTime } from '@/utils/format';
import { apiErrorMessage } from '@/lib/api';
import { PAYMENT_METHOD_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

const schema = z.object({
  method: z.enum(['bkash', 'nagad', 'rocket', 'bank']),
  senderNumber: z.string().min(6, 'Enter the number you paid from'),
  trxId: z.string().min(4, 'Enter the transaction ID from your payment SMS'),
  bankName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PaymentPage() {
  const { bookingId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: Boolean(bookingId),
  });

  const { data: instructions } = useQuery({
    queryKey: ['payment-instructions'],
    queryFn: fetchPaymentInstructions,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'bkash', senderNumber: '', trxId: '', bankName: '' },
  });

  const method = watch('method');

  const submit = useMutation({
    mutationFn: (values: FormValues) =>
      submitPayment(bookingId, {
        method: values.method,
        senderNumber: values.senderNumber,
        trxId: values.trxId,
        amount: booking!.payableAmount,
        bankName: values.bankName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      navigate(`/bookings/${bookingId}/success`);
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not submit that transaction')),
  });

  async function copyNumber(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading || !booking) {
    return (
      <div className="container max-w-3xl space-y-4 py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isCash = booking.paymentMethod === 'cash';
  const receiver = instructions?.receiverNumber ?? booking.receiverNumber ?? '';

  if (booking.status === 'CONFIRMED' || booking.status === 'AWAITING_VERIFICATION') {
    return (
      <div className="container max-w-2xl py-12">
        <div className="card p-8 text-center">
          <StatusBadge status={booking.status} />
          <h1 className="mt-4 font-display text-2xl font-bold">
            {booking.status === 'CONFIRMED' ? 'Your ticket is ready' : 'Payment under review'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Booking {booking.bookingCode}
          </p>
          <Button className="mt-6" onClick={() => navigate(`/bookings/${bookingId}/success`)}>
            View booking
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="font-display text-2xl font-bold">Complete your payment</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Booking {booking.bookingCode} · Seats {booking.seatNumbers.join(', ')}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {isCash ? (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Banknote className="h-5 w-5 text-success" aria-hidden />
                Pay cash at the counter
              </h2>

              <ol className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <Step n={1}>Download your booking voucher below.</Step>
                <Step n={2}>
                  Visit any counter and show the voucher or give the code{' '}
                  <strong className="font-semibold">{booking.bookingCode}</strong>.
                </Step>
                <Step n={3}>
                  Pay <strong className="font-semibold">৳{formatBdt(booking.payableAmount)}</strong> in
                  cash. Staff will issue your ticket immediately.
                </Step>
              </ol>

              {booking.holdExpiresAt && (
                <div className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
                  Your seats are reserved until {formatDateTime(booking.holdExpiresAt)}. After that
                  they are released for other travellers.
                </div>
              )}

              <Button
                className="mt-6"
                variant="secondary"
                onClick={() => downloadTicket(booking._id, booking.bookingCode)}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download voucher
              </Button>
            </section>
          ) : (
            <>
              <section className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Smartphone className="h-5 w-5 text-brand-600" aria-hidden />
                  Send ৳{formatBdt(booking.payableAmount)} to this number
                </h2>

                <div className="mt-5 rounded-xl bg-brand-gradient p-5 text-white">
                  <div className="text-sm text-white/80">Receiving number (Personal)</div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="font-display text-2xl font-bold tracking-wide">{receiver}</span>
                    <button
                      type="button"
                      onClick={() => copyNumber(receiver)}
                      aria-label="Copy receiving number"
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 transition hover:bg-white/30"
                    >
                      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-white/80">
                    Amount: ৳{formatBdt(booking.payableAmount)} — send the exact amount
                  </div>
                </div>

                <ol className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <Step n={1}>Open your bKash, Nagad or Rocket app and choose Send Money.</Step>
                  <Step n={2}>
                    Send exactly ৳{formatBdt(booking.payableAmount)} to {receiver}.
                  </Step>
                  <Step n={3}>Copy the Transaction ID (TrxID) from the confirmation SMS.</Step>
                  <Step n={4}>Paste it below. We verify and issue your ticket.</Step>
                </ol>
              </section>

              <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="card p-6">
                <h2 className="font-display text-lg font-bold">Confirm your transaction</h2>

                {booking.payment?.status === 'REJECTED' && (
                  <div className="mt-4 rounded-xl border border-danger/25 bg-danger/5 p-4 text-sm text-danger">
                    <p className="font-semibold">Your previous payment could not be verified.</p>
                    <p className="mt-1 text-danger/80">
                      {booking.payment.rejectionReason ?? 'Review your details and submit the transaction again.'}
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <span className="label">Which service did you use?</span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(['bkash', 'nagad', 'rocket', 'bank'] as PaymentMethod[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setValue('method', id as FormValues['method'])}
                        aria-pressed={method === id}
                        className={cn(
                          'rounded-xl border-2 px-3 py-3 text-sm font-medium transition',
                          method === id
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                            : 'border-line hover:border-brand-300 dark:border-line-dark',
                        )}
                      >
                        {PAYMENT_METHOD_LABELS[id]}
                      </button>
                    ))}
                  </div>
                </div>

                {method === 'bank' && (
                  <div className="mt-4">
                    <label htmlFor="bankName" className="label">Bank name</label>
                    <input id="bankName" className="input" placeholder="e.g. Dutch-Bangla Bank" {...register('bankName')} />
                  </div>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="senderNumber" className="label">
                      {method === 'bank' ? 'Account number' : 'Your mobile number'}
                    </label>
                    <input
                      id="senderNumber"
                      className="input"
                      placeholder={method === 'bank' ? 'Account you paid from' : '01XXXXXXXXX'}
                      {...register('senderNumber')}
                    />
                    {errors.senderNumber && (
                      <p className="mt-1 text-xs text-danger">{errors.senderNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="trxId" className="label">Transaction ID (TrxID)</label>
                    <input
                      id="trxId"
                      className="input uppercase"
                      placeholder="e.g. 8N7A2K4M1P"
                      {...register('trxId')}
                    />
                    {errors.trxId && <p className="mt-1 text-xs text-danger">{errors.trxId.message}</p>}
                  </div>
                </div>

                <Button type="submit" full size="lg" className="mt-6" loading={submit.isPending}>
                  Submit for verification
                </Button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Our team verifies every transaction before issuing your ticket.
                </p>
              </form>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Summary</h2>

            <div className="mt-4 border-b border-line pb-4 text-sm dark:border-line-dark">
              <div className="font-semibold">{booking.operator.name}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">
                {booking.route.from} → {booking.route.to}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {booking.trip.departureLabel} · Seats {booking.seatNumbers.join(', ')}
              </div>
            </div>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Fare</dt>
                <dd>৳{formatBdt(booking.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Service charge</dt>
                <dd>৳{formatBdt(booking.serviceCharge)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold dark:border-line-dark">
                <dt>Total</dt>
                <dd className="text-brand-600">৳{formatBdt(booking.payableAmount)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/25 dark:text-brand-300">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
