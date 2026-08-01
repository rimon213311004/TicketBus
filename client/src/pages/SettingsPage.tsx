import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Moon, Sun, LogOut, User as UserIcon, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword, logout as logoutRequest } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { fadeUp, stagger } from '@/animations/variants';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Re-enter the new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  });

type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const change = useMutation({
    mutationFn: (values: FormValues) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not change your password')),
  });

  async function handleLogout() {
    await logoutRequest().catch(() => undefined);
    clearSession();
    navigate('/');
  }

  return (
    <div className="container max-w-2xl py-10">
      <motion.div variants={stagger} initial="hidden" animate="visible">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Settings</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Appearance, security and account actions.
          </p>
        </motion.div>

        <motion.section variants={fadeUp} className="card mt-7 p-6">
          <h2 className="font-display text-lg font-bold">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose how TicketBus looks on this device.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (theme !== option) toggle();
                }}
                aria-pressed={theme === option}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                  theme === option
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25'
                    : 'border-line hover:bg-slate-50 dark:border-line-dark dark:hover:bg-slate-800',
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {option === 'light' ? (
                    <Sun className="h-5 w-5" aria-hidden />
                  ) : (
                    <Moon className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold capitalize">{option}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {option === 'light' ? 'Bright and high contrast' : 'Easier on the eyes at night'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="card mt-5 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <KeyRound className="h-5 w-5 text-slate-400" aria-hidden />
            Change password
          </h2>

          <form onSubmit={handleSubmit((v) => change.mutate(v))} className="mt-4 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="label">Current password</label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className="input"
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-danger">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="label">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="input"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" loading={change.isPending}>
              Update password
            </Button>
          </form>
        </motion.section>

        <motion.section variants={fadeUp} className="card mt-5 p-6">
          <h2 className="font-display text-lg font-bold">Account</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Signed in as {user?.email}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="secondary" asChild>
              <Link to="/profile">
                <UserIcon className="h-4 w-4" aria-hidden />
                Edit profile
              </Link>
            </Button>
            <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
