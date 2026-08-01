import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, User, Wallet } from 'lucide-react';
import { createBooking, fetchTrip, fetchPaymentInstructions } from '@/services';
import { Button } from '@/components/ui/Button';
import { HoldTimer } from '@/components/booking/HoldTimer';
import { useBookingStore } from '@/store/bookingStore';
import { formatBdt } from '@/utils/format';
import { apiErrorMessage } from '@/lib/api';
import { PAYMENT_METHOD_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

const SERVICE_CHARGE_PER_SEAT = 20;

const schema = z.object({
  passengers: z.array(
    z.object({
      name: z.string().min(2, 'Enter the full name'),
      age: z.string().optional(),
      gender: z.enum(['male', 'female', 'other']),
      seatNumber: z.string(),
    }),
  ),
  contactName: z.string().min(2, 'Enter your name'),
  contactPhone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
  contactEmail: z.string().email('Enter a valid email address'),
  boardingPointId: z.string().min(1, 'Choose a boarding point'),
  droppingPointId: z.string().min(1, 'Choose a dropping point'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'bank', 'cash']),
});

type FormValues = z.infer<typeof schema>;

export function PassengerDetailsPage() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const { seatNumbers, holdExpiresAt } = useBookingStore();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: Boolean(tripId),
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
    defaultValues: {
      passengers: seatNumbers.map((seatNumber) => ({
        name: '',
        age: '',
        gender: 'male' as const,
        seatNumber,
      })),
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      boardingPointId: '',
      droppingPointId: '',
      paymentMethod: 'bkash',
    },
  });

  const selectedMethod = watch('paymentMethod');

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      createBooking({
        tripId,
        seatNumbers,
        passengers: values.passengers.map((p) => ({
          name: p.name,
          age: p.age ? Number(p.age) : undefined,
          gender: p.gender,
          seatNumber: p.seatNumber,
        })),
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        boardingPointId: values.boardingPointId,
        droppingPointId: values.droppingPointId,
        paymentMethod: values.paymentMethod,
      }),
    onSuccess: (booking) => navigate(`/bookings/${booking._id}/payment`),
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not create the booking')),
  });

  if (seatNumbers.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-slate-500">No seats selected.</p>
        <Button className="mt-4" onClick={() => navigate(`/trips/${tripId}/seats`)}>
          Choose seats
        </Button>
      </div>
    );
  }

  const fare = trip?.fare ?? 0;
  const subtotal = fare * seatNumbers.length;
  const serviceCharge = SERVICE_CHARGE_PER_SEAT * seatNumbers.length;

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to seats
      </Button>

      {holdExpiresAt && (
        <div className="mb-6">
          <HoldTimer
            expiresAt={holdExpiresAt}
            onExpire={() => {
              toast.error('Your seat hold expired');
              navigate(`/trips/${tripId}/seats`);
            }}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) => create.mutate(values))}
        className="grid gap-6 lg:grid-cols-[1fr_340px]"
      >
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <User className="h-5 w-5 text-brand-600" aria-hidden />
              Passenger details
            </h2>

            <div className="mt-5 space-y-5">
              {seatNumbers.map((seat, index) => (
                <div key={seat} className="rounded-xl border border-line p-4 dark:border-line-dark">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-300">
                      Seat {seat}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_100px_140px]">
                    <div>
                      <label htmlFor={`name-${index}`} className="label">Full name</label>
                      <input
                        id={`name-${index}`}
                        className="input"
                        placeholder="As on your NID"
                        {...register(`passengers.${index}.name`)}
                      />
                      {errors.passengers?.[index]?.name && (
                        <p className="mt-1 text-xs text-danger">
                          {errors.passengers[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`age-${index}`} className="label">Age</label>
                      <input
                        id={`age-${index}`}
                        type="number"
                        min={1}
                        max={120}
                        className="input"
                        {...register(`passengers.${index}.age`)}
                      />
                    </div>

                    <div>
                      <label htmlFor={`gender-${index}`} className="label">Gender</label>
                      <select id={`gender-${index}`} className="input" {...register(`passengers.${index}.gender`)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Contact details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              We send your ticket and any trip updates here.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="contactName" className="label">Name</label>
                <input id="contactName" className="input" {...register('contactName')} />
                {errors.contactName && <p className="mt-1 text-xs text-danger">{errors.contactName.message}</p>}
              </div>
              <div>
                <label htmlFor="contactPhone" className="label">Mobile</label>
                <input id="contactPhone" className="input" placeholder="01XXXXXXXXX" {...register('contactPhone')} />
                {errors.contactPhone && <p className="mt-1 text-xs text-danger">{errors.contactPhone.message}</p>}
              </div>
              <div>
                <label htmlFor="contactEmail" className="label">Email</label>
                <input id="contactEmail" type="email" className="input" {...register('contactEmail')} />
                {errors.contactEmail && <p className="mt-1 text-xs text-danger">{errors.contactEmail.message}</p>}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Boarding &amp; dropping</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="boardingPointId" className="label">Boarding point</label>
                <select id="boardingPointId" className="input" {...register('boardingPointId')}>
                  <option value="">Select a boarding point</option>
                  {trip?.boardingPoints?.map((point) => (
                    <option key={point._id} value={point._id}>
                      {point.name} ({point.minutesBeforeDeparture} min early)
                    </option>
                  ))}
                </select>
                {errors.boardingPointId && (
                  <p className="mt-1 text-xs text-danger">{errors.boardingPointId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="droppingPointId" className="label">Dropping point</label>
                <select id="droppingPointId" className="input" {...register('droppingPointId')}>
                  <option value="">Select a dropping point</option>
                  {trip?.droppingPoints?.map((point) => (
                    <option key={point._id} value={point._id}>
                      {point.name}
                    </option>
                  ))}
                </select>
                {errors.droppingPointId && (
                  <p className="mt-1 text-xs text-danger">{errors.droppingPointId.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Wallet className="h-5 w-5 text-brand-600" aria-hidden />
              How would you like to pay?
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {instructions?.methods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setValue('paymentMethod', method.id as PaymentMethod)}
                  aria-pressed={selectedMethod === method.id}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition',
                    selectedMethod === method.id
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-line hover:border-brand-300 dark:border-line-dark',
                  )}
                >
                  <div className="font-semibold">{PAYMENT_METHOD_LABELS[method.id] ?? method.label}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {method.id === 'cash'
                      ? 'Reserve now, pay at the counter'
                      : `Send to ${method.number}`}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Booking summary</h2>

            {trip && (
              <div className="mt-4 border-b border-line pb-4 text-sm dark:border-line-dark">
                <div className="font-semibold">{trip.operator.name}</div>
                <div className="mt-1 text-slate-500 dark:text-slate-400">
                  {trip.route.from} → {trip.route.to}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {trip.departureLabel} · {trip.busType}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {seatNumbers.map((seat) => (
                <span
                  key={seat}
                  className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-300"
                >
                  {seat}
                </span>
              ))}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm dark:border-line-dark">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Fare ({seatNumbers.length} × ৳{formatBdt(fare)})
                </dt>
                <dd>৳{formatBdt(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Service charge</dt>
                <dd>৳{formatBdt(serviceCharge)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold dark:border-line-dark">
                <dt>Total payable</dt>
                <dd className="text-brand-600">৳{formatBdt(subtotal + serviceCharge)}</dd>
              </div>
            </dl>

            <Button type="submit" full size="lg" className="mt-6" loading={create.isPending}>
              Continue to payment
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
