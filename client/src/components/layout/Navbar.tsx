import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Moon, Sun, Menu, X, LogOut, Ticket, LayoutDashboard, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { logout as logoutRequest } from '@/services';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search Buses' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { user, clearSession } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutRequest().catch(() => undefined);
    clearSession();
    setOpen(false);
    navigate('/');
  }

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 border-b border-line bg-[#f7f5f0]/90 backdrop-blur-lg dark:border-line-dark dark:bg-surface-dark/90"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Bus className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold">TicketBus</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/25 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Button variant="secondary" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/admin">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Admin Panel
            </Link>
          </Button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-tickets">
                  <Ticket className="h-4 w-4" aria-hidden />
                  My Tickets
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" aria-hidden />
                  Profile
                </Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-line bg-white md:hidden dark:border-line-dark dark:bg-surface-dark"
        >
          <div className="container space-y-1 py-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-line pt-3 dark:border-line-dark">
              <Button variant="secondary" size="sm" full asChild>
                <Link to="/admin" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Admin Panel
                </Link>
              </Button>
              {user ? (
                <>
                  {[
                    { to: '/my-tickets', label: 'My Tickets' },
                    { to: '/profile', label: 'Profile' },
                    { to: '/settings', label: 'Settings' },
                  ].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1">
                  <Button variant="secondary" size="sm" full asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                  <Button size="sm" full asChild>
                    <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
