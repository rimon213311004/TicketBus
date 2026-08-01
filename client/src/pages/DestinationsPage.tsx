import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Search, Building2, Route as RouteIcon, Star } from 'lucide-react';
import { fetchDivisions } from '@/services';
import { fadeUp, stagger, hoverLift } from '@/animations/variants';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Division, DivisionStop } from '@/types';

/** Search from the traveller's most likely origin unless they are already there. */
function searchLink(city: string): string {
  const from = city === 'Dhaka' ? 'Chattogram' : 'Dhaka';
  return `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(city)}`;
}

function StopChip({ stop, accent }: { stop: DivisionStop; accent: string }) {
  return (
    <Link
      to={searchLink(stop.name)}
      title={`${stop.destinations} direct destinations · ${stop.terminals} terminal${stop.terminals === 1 ? '' : 's'}`}
      className="group flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 transition hover:border-brand-300 hover:bg-brand-50/60 dark:border-line-dark dark:hover:bg-slate-800/60"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 truncate text-sm font-medium">
          {stop.isHq && (
            <Star
              className="h-3 w-3 shrink-0 fill-current"
              style={{ color: accent }}
              aria-label="Divisional headquarter"
            />
          )}
          {stop.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">{stop.bn}</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-slate-400 group-hover:text-brand-600">
        {stop.destinations}
      </span>
    </Link>
  );
}

function DivisionCard({ division }: { division: Division }) {
  return (
    <motion.section
      id={division.name.toLowerCase()}
      variants={fadeUp}
      {...hoverLift}
      className="card scroll-mt-24 overflow-hidden"
    >
      <header
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${division.accent}, ${division.accent}bb)` }}
      >
        <div>
          <h2 className="text-lg font-bold">{division.name} Division</h2>
          <p className="text-sm text-white/85">{division.bn}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4" aria-hidden />
            {division.districtCount} districts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RouteIcon className="h-4 w-4" aria-hidden />
            {division.routeCount} routes
          </span>
        </div>
      </header>

      <div className="p-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {division.districts.map((stop) => (
            <StopChip key={stop.name} stop={stop} accent={division.accent} />
          ))}
        </div>

        {division.touristStops.length > 0 && (
          <div className="mt-5 border-t border-line pt-4 dark:border-line-dark">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tourist stops
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {division.touristStops.map((stop) => (
                <StopChip key={stop.name} stop={stop} accent={division.accent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export function DestinationsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['divisions'], queryFn: fetchDivisions });
  const [query, setQuery] = useState('');
  const { hash } = useLocation();

  // The divisions arrive after mount, so the browser cannot honour #dhaka itself.
  useEffect(() => {
    if (!hash || !data) return;
    document
      .getElementById(decodeURIComponent(hash.slice(1)))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, data]);

  const divisions = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data.divisions;

    return data.divisions
      .map((division) => ({
        ...division,
        districts: division.districts.filter(
          (s) => s.name.toLowerCase().includes(needle) || s.bn.includes(needle),
        ),
        touristStops: division.touristStops.filter(
          (s) => s.name.toLowerCase().includes(needle) || s.bn.includes(needle),
        ),
      }))
      .filter(
        (division) =>
          division.districts.length > 0 ||
          division.touristStops.length > 0 ||
          division.name.toLowerCase().includes(needle),
      );
  }, [data, query]);

  return (
    <div className="container py-10 md:py-14">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl">
        <motion.h1 variants={fadeUp} className="text-3xl font-extrabold md:text-4xl">
          Where do you want to go?
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 text-slate-500 dark:text-slate-400">
          We run coaches to all {data?.totalDistricts ?? 64} districts of Bangladesh across every
          division, plus the tourist towns in between — {data?.totalRoutes ?? 0} direct routes in
          total. Pick a district to see today&apos;s departures.
        </motion.p>

        <motion.div variants={fadeUp} className="relative mt-6">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <label htmlFor="district-search" className="sr-only">
            Search a district
          </label>
          <input
            id="district-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a district — Bogura, কক্সবাজার, Sylhet…"
            className="input pl-10"
          />
        </motion.div>
      </motion.div>

      {isLoading ? (
        <div className="mt-10 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="h-20 w-full rounded-none" />
              <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((__, j) => (
                  <Skeleton key={j} className="h-14 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : divisions.length === 0 ? (
        <p className="mt-12 flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <MapPin className="h-4 w-4" aria-hidden />
          No district matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mt-10 space-y-6"
        >
          {divisions.map((division) => (
            <DivisionCard key={division.name} division={division} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
