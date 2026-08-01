import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, BusFront } from 'lucide-react';
import { useState } from 'react';
import { searchTrips } from '@/services';
import { SearchCard } from '@/components/search/SearchCard';
import { BusCard } from '@/components/search/BusCard';
import { BusCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AC_TYPE_OPTIONS, BUS_TYPE_OPTIONS, SORT_OPTIONS } from '@/constants';
import { stagger } from '@/animations/variants';
import { toDateInput, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const from = params.get('from') ?? 'Dhaka';
  const to = params.get('to') ?? 'Chattogram';
  const date = params.get('date') ?? toDateInput(new Date());
  const acType = params.get('acType') ?? '';
  const busType = params.get('busType') ?? '';
  const sort = params.get('sort') ?? 'departure';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['trips', from, to, date, acType, busType, sort],
    queryFn: () =>
      searchTrips({
        from,
        to,
        date,
        acType: acType || undefined,
        busType: busType || undefined,
        sort,
      }),
    enabled: Boolean(from && to && date),
  });

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  const trips = data?.trips ?? [];

  return (
    <div className="container py-8">
      <SearchCard initialFrom={from} initialTo={to} initialDate={date} />

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold md:text-2xl">
            {from} → {to}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatDate(date, 'long')}
            {data ? ` · ${data.total} ${data.total === 1 ? 'bus' : 'buses'}` : ''}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={cn('space-y-5', filtersOpen ? 'block' : 'hidden lg:block')}>
          <div className="card p-5">
            <h2 className="text-sm font-semibold">Sort by</h2>
            <div className="mt-3 space-y-1.5">
              {SORT_OPTIONS.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === option.value}
                    onChange={() => updateFilter('sort', option.value)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold">Coach type</h2>
            <div className="mt-3 space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="radio"
                  name="acType"
                  checked={acType === ''}
                  onChange={() => updateFilter('acType', '')}
                  className="h-4 w-4 accent-brand-600"
                />
                All
              </label>
              {AC_TYPE_OPTIONS.map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="acType"
                    checked={acType === option}
                    onChange={() => updateFilter('acType', option)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold">Bus class</h2>
            <div className="mt-3 space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="radio"
                  name="busType"
                  checked={busType === ''}
                  onChange={() => updateFilter('busType', '')}
                  className="h-4 w-4 accent-brand-600"
                />
                All
              </label>
              {BUS_TYPE_OPTIONS.map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="busType"
                    checked={busType === option}
                    onChange={() => updateFilter('busType', option)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section>
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <BusCardSkeleton key={i} />)}
            </div>
          )}

          {isError && (
            <div className="card p-10 text-center">
              <p className="text-slate-500">We could not load buses right now. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && trips.length === 0 && (
            <div className="card p-12 text-center">
              <BusFront className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">No buses on this route</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try a different date, or clear your filters.
              </p>
            </div>
          )}

          {trips.length > 0 && (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {trips.map((trip) => <BusCard key={trip._id} trip={trip} />)}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
