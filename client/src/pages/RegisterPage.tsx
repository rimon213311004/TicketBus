import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';
import { toast } from 'sonner';
import { register as registerRequest } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { scaleIn } from '@/animations/variants';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
  password: z.string().min(6, 'Use at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      toast.success('Account created');
      navigate('/', { replace: true });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not create your account')),
  });

  return (
    <div className="container flex min-h-[70vh] max-w-md items-center py-12">
      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="w-full">
        <div className="text-center">
          <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white">
            <Bus className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Book tickets in seconds, every time
          </p>
        </div>

        <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="card mt-7 space-y-4 p-6">
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" autoComplete="name" className="input" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">Mobile number</label>
            <input id="phone" autoComplete="tel" placeholder="01XXXXXXXXX" className="input" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>

          <Button type="submit" full size="lg" loading={submit.isPending}>
            Create account
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
