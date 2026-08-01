import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone, ShieldCheck, Ticket, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMe, updateProfile } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiErrorMessage } from '@/lib/api';
import { fadeUp } from '@/animations/variants';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
});

type FormValues = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  operator: 'Operator',
  admin: 'Administrator',
};

export function ProfilePage() {
  const { user: cachedUser, setUser } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    initialData: cachedUser ?? undefined,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  // Keep the persisted store in step with whatever the server last told us.
  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  const save = useMutation({
    mutationFn: (values: FormValues) => updateProfile(values),
    onSuccess: (updated) => {
      setUser(updated);
      reset({ name: updated.name, phone: updated.phone });
      toast.success('Profile updated');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update your profile')),
  });

  if (isLoading && !user) {
    return (
      <div className="container max-w-2xl py-10">
        <Skeleton className="h-8 w-40" />
        <div className="card mt-7 space-y-4 p-6">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>
    );
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="container max-w-2xl py-10">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Profile</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Your account details. Contact info on a booking is entered separately at checkout.
        </p>

        <div className="card mt-7 flex flex-wrap items-center gap-5 p-6">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <span
              className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient font-display text-xl font-bold text-white"
              aria-hidden
            >
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <div className="font-display text-lg font-bold">{user?.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" aria-hidden />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" aria-hidden />
                {user?.phone}
              </span>
            </div>
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-line-dark dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((v) => save.mutate(v))}
          className="card mt-5 space-y-4 p-6"
        >
          <h2 className="font-display text-lg font-bold">Edit details</h2>

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" autoComplete="name" className="input" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">Mobile number</label>
            <input
              id="phone"
              autoComplete="tel"
              className="input"
              placeholder="01XXXXXXXXX"
              {...register('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" className="input" value={user?.email ?? ''} disabled readOnly />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Email is tied to your sign-in and cannot be changed here.
            </p>
          </div>

          <Button type="submit" loading={save.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button variant="secondary" asChild>
            <Link to="/my-tickets">
              <Ticket className="h-4 w-4" aria-hidden />
              My tickets
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings">
              <SettingsIcon className="h-4 w-4" aria-hidden />
              Settings
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
