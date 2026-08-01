import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, CalendarDays, ArrowLeftRight, Search } from 'lucide-react';
import { fetchCities } from '@/services';
import { Button } from '@/components/ui/Button';
import { toDateInput } from '@/utils/format';
import { scaleIn } from '@/animations/variants';

interface SearchCardProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

export function SearchCard({ initialFrom, initialTo, initialDate }: SearchCardProps) {
  const navigate = useNavigate();
  const { data: cities } = useQuery({ queryKey: ['cities'], queryFn: fetchCities });

  const [from, setFrom] = useState(initialFrom ?? 'Dhaka');
  const [to, setTo] = useState(initialTo ?? 'Chattogram');
  const [date, setDate] = useState(initialDate ?? toDateInput(new Date()));
  const [error, setError] = useState<string | null>(null);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError('Origin and destination must be different');
      return;
    }
    setError(null);
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  }

  return (
    <motion.form
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="card overflow-hidden p-5 shadow-lift md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-700/70">
        <div>
          <p className="text-sm font-semibold text-brand-600">Plan your next ride</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Find the best bus in seconds</h2>
        </div>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/25 dark:text-brand-300"
        >
          Live seat updates
        </motion.span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="from" className="label">From</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="from"
              list="from-cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input pl-10"
              placeholder="Departure city"
              required
            />
            <datalist id="from-cities">
              {cities?.from.map((city) => <option key={city} value={city} />)}
            </datalist>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-slate-500 shadow-sm transition hover:border-brand-600 hover:text-brand-600 dark:border-line-dark dark:bg-slate-900"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden />
        </motion.button>

        <div>
          <label htmlFor="to" className="label">To</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="to"
              list="to-cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input pl-10"
              placeholder="Destination city"
              required
            />
            <datalist id="to-cities">
              {cities?.to.map((city) => <option key={city} value={city} />)}
            </datalist>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="label">Journey date</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="date"
              type="date"
              value={date}
              min={toDateInput(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="md:w-auto">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </Button>
        </motion.div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-3 text-sm text-danger"
        >
          {error}
        </motion.p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Secure booking</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Flexible payments</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Instant e-tickets</span>
      </div>
    </motion.form>
  );
}
