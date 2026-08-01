import { motion } from 'framer-motion';
import { Bus, MapPin, Users, ShieldCheck, Globe, Award } from 'lucide-react';
import { stagger, fadeUp, hoverLift } from '@/animations/variants';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified operators',
    body: 'Every coach on TicketBus is operated by a licensed partner. We verify registrations, insurance, and safety equipment before a bus goes live.',
  },
  {
    icon: Users,
    title: 'Seat guarantee',
    body: 'Your seat is locked the moment you select it. No double bookings, no surprises at the terminal.',
  },
  {
    icon: MapPin,
    title: 'All 64 districts',
    body: 'From Dhaka to Tetulia, from Rangamati to Barguna — we cover every corner of Bangladesh.',
  },
  {
    icon: Globe,
    title: 'Local support',
    body: 'Our support team speaks your language and operates in your time zone. Chat, call, or email — we are here to help.',
  },
  {
    icon: Award,
    title: 'Trusted by thousands',
    body: 'Over 50,000 travellers book with us every month across 120+ verified operators.',
  },
  {
    icon: Bus,
    title: 'Every coach type',
    body: 'AC, Non-AC, sleeper, executive, business and double-decker — pick the ride that fits your journey and budget.',
  },
];

export function AboutPage() {
  return (
    <div className="py-16">
      <section className="container">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900/25 dark:text-brand-300"
          >
            <Bus className="h-4 w-4" aria-hidden />
            About TicketBus
          </motion.span>

          <motion.h1 variants={fadeUp} className="mt-5 font-display text-3xl font-extrabold md:text-5xl">
            Booking Bangladesh's buses, reimagined
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            TicketBus started in 2024 with a simple idea: booking a bus ticket in Bangladesh should be as
            easy as booking a flight. Instead of calling terminals, visiting counters, or relying on
            last-minute seat availability, you can compare every operator on your route, pick your exact
            seat, and pay however suits you — all in under a minute.
          </motion.p>

          <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            We serve travellers across all 64 districts, partnering with 120+ trusted operators and
            covering every coach type — from budget Non-AC to luxury AC sleepers. Whether you are
            heading to the hills, the coast, or just across town, we make sure your seat is real and
            your ticket is digital.
          </motion.p>
        </motion.div>
      </section>

      <section className="container mt-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {VALUES.map((value) => (
            <motion.div
              key={value.title}
              variants={fadeUp}
              {...hoverLift}
              className="card flex flex-col items-center p-8 text-center"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/25 dark:text-brand-300">
                <value.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{value.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mt-20">
        <div className="overflow-hidden rounded-3xl bg-brand-gradient/5">
          <div className="grid gap-8 md:grid-cols-[1fr_0.6fr]">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Built by travellers, for travellers</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                TicketBus is built and maintained by Raihan Rimon, a Dhaka-based developer who has spent
                too many hours at bus terminals waiting for last-minute seats. The platform is his answer
                to a problem every Bangladeshi traveller knows too well.
              </p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Have feedback, a bug to report, or just want to say hi? We would love to hear from you.
              </p>
            </div>

            <div className="flex items-center justify-center p-8">
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-brand-gradient text-white">
                <Bus className="h-10 w-10" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
