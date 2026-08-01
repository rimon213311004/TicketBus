import { Link } from 'react-router-dom';
import { Bus, Phone, Mail } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Popular routes',
    links: [
      { to: '/search?from=Dhaka&to=Chattogram', label: 'Dhaka → Chattogram' },
      { to: "/search?from=Dhaka&to=Cox's Bazar", label: "Dhaka → Cox's Bazar" },
      { to: '/search?from=Dhaka&to=Sylhet', label: 'Dhaka → Sylhet' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/my-tickets', label: 'My tickets' },
      { to: '/profile', label: 'Profile' },
      { to: '/settings', label: 'Settings' },
      { to: '/login', label: 'Sign in' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-white dark:border-line-dark dark:bg-card-dark">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
                <Bus className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold">TicketBus</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Book AC, Non-AC and sleeper coaches across Bangladesh. Pay with bKash, Nagad, Rocket,
              bank transfer, or cash at the counter.
            </p>
            <div className="mt-5 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <a href="tel:01875895858" className="flex items-center gap-2 hover:text-brand-600">
                <Phone className="h-4 w-4" aria-hidden />
                01875895858
              </a>
              <a href="mailto:support@ticketbus.com" className="flex items-center gap-2 hover:text-brand-600">
                <Mail className="h-4 w-4" aria-hidden />
                raihanrimon853@gmail.com
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-6 text-center text-xs text-slate-400 dark:border-line-dark">
          © {new Date().getFullYear()} TicketBus @copyright Raihan Rimon.
        </div>
      </div>
    </footer>
  );
}
