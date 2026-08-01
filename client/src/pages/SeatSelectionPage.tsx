import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Armchair } from 'lucide-react';
import { fetchSeats, fetchTrip, holdSeats } from '@/services';
import { SeatLayout } from '@/components/booking/SeatLayout';
import { SeatMapSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useBookingStore, MAX_SEATS_PER_BOOKING } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { formatBdt, formatDate } from '@/utils/format';
import { apiErrorMessage } from '@/lib/api';

export function SeatSelectionPage() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { seatNumbers, toggleSeat, setTrip, setHold } = useBookingStore();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: Boolean(tripId),
  });

  const { data: seatMap, isLoading, refetch } = useQuery({
    queryKey: ['seats', tripId],
    queryFn: () => fetchSeats(tripId),
    enabled: Boolean(tripId),
    refetchInterval: 20_000,
  });

  useEffect(() => {
    if (trip) setTrip(trip);
  }, [trip, setTrip]);

  const hold = useMutation({
    mutationFn: () => holdSeats(tripId, seatNumbers),
    onSuccess: (data) => {
      setHold(data.seatNumbers, data.expiresAt);
      navigate(`/trips/${tripId}/passengers`);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not hold those seats'));
      refetch();
    },
  });

  function handleContinue() {
    if (!user) {
      navigate('/login', { state: { from: `/trips/${tripId}/seats` } });
      return;
    }
    if (seatNumbers.length === 0) {
      toast.error('Select at least one seat to continue');
      return;
    }
    hold.mutate();
  }

  const total = (seatMap?.fare ?? 0) * seatNumbers.length;

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to results
      </Button>

      {trip && (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            {trip.operator.logo && (
              <img src={trip.operator.logo} alt="" className="h-14 w-14 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="font-display text-lg font-bold">{trip.operator.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {trip.route.from} → {trip.route.to} · {trip.busType} · {trip.acType}
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">
              {trip.departureLabel} — {trip.arrivalLabel}
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              {formatDate(trip.departureTime, 'long')}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Choose your seats</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Up to {MAX_SEATS_PER_BOOKING} per booking
            </span>
          </div>

          {isLoading || !seatMap ? (
            <SeatMapSkeleton />
          ) : (
            <SeatLayout
              seats={seatMap.seats}
              columns={seatMap.columns}
              selected={seatNumbers}
              onToggle={toggleSeat}
              maxSeats={MAX_SEATS_PER_BOOKING}
            />
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Your selection</h2>

            {seatNumbers.length === 0 ? (
              <div className="mt-6 text-center">
                <Armchair className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Pick a seat from the map to get started.
                </p>
              </div>
            ) : (
              <>
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
                    <dt className="text-slate-500 dark:text-slate-400">Fare per seat</dt>
                    <dd>৳{formatBdt(seatMap?.fare ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Seats</dt>
                    <dd>{seatNumbers.length}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold dark:border-line-dark">
                    <dt>Subtotal</dt>
                    <dd className="text-brand-600">৳{formatBdt(total)}</dd>
                  </div>
                </dl>
              </>
            )}

            <Button
              full
              size="lg"
              className="mt-6"
              onClick={handleContinue}
              loading={hold.isPending}
              disabled={seatNumbers.length === 0}
            >
              Continue
            </Button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Seats are held for 15 minutes once you continue.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
