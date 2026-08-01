import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Armchair, Wifi, Snowflake, ArrowRight } from 'lucide-react';
import type { Trip } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatBdt, formatDuration } from '@/utils/format';
import { fadeUp, hoverLift } from '@/animations/variants';

export function BusCard({ trip }: { trip: Trip }) {
  const soldOut = trip.availableSeats === 0;
  const scarce = trip.availableSeats > 0 && trip.availableSeats <= 5;

  return (
    <motion.article variants={fadeUp} {...hoverLift} className="card overflow-hidden p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-1 items-start gap-4">
          {trip.bus.images.length > 0 ? (
            <img
              src={trip.bus.images[0]}
              alt={`${trip.bus.name} coach`}
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          ) : trip.operator.logo ? (
            <img
              src={trip.operator.logo}
              alt=""
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-xl bg-brand-50" aria-hidden />
          )}

          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold">{trip.operator.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
                {trip.operator.rating.toFixed(1)}
              </span>
              <span>{trip.busType}</span>
              <span className="inline-flex items-center gap-1">
                {trip.acType === 'AC' && <Snowflake className="h-3.5 w-3.5" aria-hidden />}
                {trip.acType}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {trip.bus?.amenities?.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {amenity === 'Wi-Fi' && <Wifi className="h-3 w-3" aria-hidden />}
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <div className="text-center">
            <div className="font-display text-xl font-bold">{trip.departureLabel}</div>
            <div className="text-xs text-slate-400">{trip.route.from}</div>
          </div>

          <div className="flex flex-col items-center text-slate-400">
            <span className="text-xs">{formatDuration(trip.route.durationMinutes)}</span>
            <div className="my-1 h-px w-14 bg-line dark:bg-line-dark" />
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </div>

          <div className="text-center">
            <div className="font-display text-xl font-bold">{trip.arrivalLabel}</div>
            <div className="text-xs text-slate-400">{trip.route.to}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line pt-4 md:min-w-[170px] md:flex-col md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0 dark:border-line-dark">
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-brand-600">
              ৳{formatBdt(trip.fare)}
            </div>
            <div
              className={
                scarce
                  ? 'mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-warning'
                  : 'mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400'
              }
            >
              <Armchair className="h-3 w-3" aria-hidden />
              {soldOut ? 'Sold out' : `${trip.availableSeats} seats left`}
            </div>
          </div>

          <Button size="sm" disabled={soldOut} asChild={!soldOut}>
            {soldOut ? (
              <span>Sold out</span>
            ) : (
              <Link to={`/trips/${trip._id}/seats`}>Select seats</Link>
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
