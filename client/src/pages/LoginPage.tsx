import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { scaleIn } from '@/animations/variants';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/my-tickets';
  const isAdminLogin = redirectTo.startsWith('/admin');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isAdminLogin ? { email: 'rimon@ticketbus.com', password: '' } : undefined,
  });

  const submit = useMutation({
    mutationFn: (values: FormValues) => login(values.email, values.password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not sign you in')),
  });

  return (
    <div className="container flex min-h-[70vh] max-w-md items-center py-12">
      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="w-full">
        <div className="text-center">
          <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white">
            <Bus className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">
            {isAdminLogin ? 'Admin sign in' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {isAdminLogin ? 'Sign in to open the TicketBus control center' : 'Sign in to manage your bookings'}
          </p>
        </div>

        <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="card mt-7 space-y-4 p-6">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>

          <Button type="submit" full size="lg" loading={submit.isPending}>
            Sign in
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-5 rounded-xl border border-line bg-white/60 p-4 text-xs text-slate-500 dark:border-line-dark dark:bg-card-dark dark:text-slate-400">
          <p className="font-medium text-slate-600 dark:text-slate-300">
            {isAdminLogin ? 'Admin access' : 'Demo accounts'}
          </p>
          {!isAdminLogin && <p className="mt-1.5">Customer — demo@ticketbus.com / Demo@123</p>}
          <p className={isAdminLogin ? 'mt-1.5' : ''}>Admin — rimon@ticketbus.com / 2002</p>
        </div>
      </motion.div>
    </div>
  );
}
