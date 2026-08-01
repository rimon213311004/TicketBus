import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, Clock, Star, ArrowRight, Ticket, MapPin, Compass, Route, Sparkles } from 'lucide-react';
import { SearchCard } from '@/components/search/SearchCard';
import { FleetGallery } from '@/components/fleet/FleetGallery';
import { fetchDivisions, fetchOperators, fetchRoutes } from '@/services';
import { fadeUp, stagger, hoverLift } from '@/animations/variants';
import { formatDuration } from '@/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Guaranteed seats',
    body: 'Your seat is locked the moment you select it. No double bookings, ever.',
  },
  {
    icon: Wallet,
    title: 'Pay your way',
    body: 'bKash, Nagad, Rocket, bank transfer — or reserve now and pay cash at the counter.',
  },
  {
    icon: Ticket,
    title: 'Instant e-ticket',
    body: 'Download a QR ticket as a PDF and show it at boarding. Works offline.',
  },
  {
    icon: Clock,
    title: 'Live availability',
    body: 'Seat maps update as others book, so you always see what is truly free.',
  },
];

export function HomePage() {
  const { data: operators, isLoading: loadingOperators } = useQuery({
    queryKey: ['operators'],
    queryFn: fetchOperators,
  });
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchRoutes });
  const { data: divisionData } = useQuery({ queryKey: ['divisions'], queryFn: fetchDivisions });

  return (
    <div>
      <section className="relative overflow-hidden bg-[#17242b] pb-32 pt-14 text-white md:pb-40 md:pt-20">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} aria-hidden />
        <motion.div animate={{ x: ['-10%', '110%'] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} className="absolute bottom-14 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-brand-300 to-transparent" aria-hidden />
        <motion.div animate={{ x: ['110%', '-20%'] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 2 }} className="absolute top-28 right-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky to-transparent" aria-hidden />
        <div className="container relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-2xl">
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 border border-brand-300/40 bg-brand-500/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Bangladesh, connected
              </motion.span>
              <motion.h1 variants={fadeUp} className="mt-5 max-w-xl text-4xl font-bold leading-[1.04] md:text-6xl">
                Your next stop is closer than you think.
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
                Compare trusted coaches, choose your seat, and get moving with one beautifully simple booking flow.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-3 border-l-2 border-brand-400 pl-4"><Route className="h-5 w-5 text-brand-300" /><div><p className="text-sm font-semibold">64 districts</p><p className="text-xs text-white/55">One connected network</p></div></div>
                <div className="flex items-center gap-3 border-l-2 border-sky pl-4"><Ticket className="h-5 w-5 text-sky" /><div><p className="text-sm font-semibold">Instant e-ticket</p><p className="text-xs text-white/55">Ready when you are</p></div></div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative mx-auto w-full max-w-xl [perspective:1200px]"
            >
              <motion.div animate={{ rotateY: [-3, 3, -3], rotateX: [1, 0, 1], y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="relative rotate-[-2deg] overflow-hidden border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm md:p-3">
                <div className="relative aspect-[1.35/1] overflow-hidden bg-[#26383c]">
                  <img src="/bus_image/hanifvolvo.jpg" alt="Hanif Volvo coach ready for departure" className="h-full w-full object-cover opacity-90 mix-blend-screen" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17242b] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">Tonight's route</p><p className="mt-1 font-display text-2xl font-bold">Dhaka <span className="text-brand-300">→</span> Chattogram</p></div><div className="border border-white/20 bg-[#17242b]/70 px-3 py-2 text-right backdrop-blur"><p className="text-[10px] uppercase tracking-widest text-white/50">from</p><p className="font-display text-lg font-bold">৳850</p></div></div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -10, 0], rotate: [3, 5, 3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-7 -left-3 hidden w-48 border border-brand-200/50 bg-[#fffaf4] p-4 text-[#17242b] shadow-2xl sm:block md:-left-8"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-600">Boarding pass</span><Ticket className="h-4 w-4 text-brand-600" /></div><div className="mt-4 flex items-center justify-between text-xs font-semibold"><span>DAC</span><span className="route-dash mx-2 h-3 flex-1" /><span>CGP</span></div><p className="mt-3 text-[10px] text-slate-500">Seat 14A · 8:30 PM · AC coach</p></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container relative -mt-24 md:-mt-28">
        <SearchCard />
      </div>

      <section className="container mt-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp} {...hoverLift} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/25 dark:text-brand-300">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Popular routes</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              The journeys travellers book most often
            </p>
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {routes?.slice(0, 6).map((route) => (
            <motion.div key={route._id} variants={fadeUp} {...hoverLift}>
              <Link
                to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                className="card group flex items-center justify-between p-5 transition hover:border-brand-300"
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-brand-600" aria-hidden />
                    {route.from} → {route.to}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    {route.distanceKm} km · {formatDuration(route.durationMinutes)}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Every division, every district</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {divisionData
                ? `${divisionData.totalRoutes} direct routes across all ${divisionData.totalDistricts} districts of Bangladesh`
                : 'Direct routes across all 64 districts of Bangladesh'}
            </p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Browse all destinations
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {divisionData?.divisions.map((division) => (
            <motion.div key={division.name} variants={fadeUp} {...hoverLift}>
              <Link
                to={`/destinations#${division.name.toLowerCase()}`}
                className="card group flex h-full flex-col p-5 transition hover:border-brand-300"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: division.accent }}
                >
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{division.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{division.bn}</p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {division.districtCount} districts · {division.routeCount} routes
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mt-20">
        <h2 className="text-2xl font-bold md:text-3xl">Our fleet</h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          AC, Non-AC and sleeper coaches from every operator on the platform
        </p>
        <FleetGallery limit={8} />
      </section>

      <section className="container mt-20">
        <h2 className="text-2xl font-bold md:text-3xl">Top rated operators</h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Every coach comes with verified amenities and safety features
        </p>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loadingOperators
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="space-y-2 p-5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            : operators?.slice(0, 8).map((operator) => (
                <motion.div key={operator._id} variants={fadeUp} {...hoverLift} className="card overflow-hidden">
                  {operator.logo && (
                    <img
                      src={operator.logo}
                      alt={`${operator.name} coach`}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold">{operator.name}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" aria-hidden />
                      <span className="font-medium">{operator.rating.toFixed(1)}</span>
                      <span className="text-slate-400">rating</span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </section>
    </div>
  );
}
