import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PlaceholderPage({ title, body }: { title: string; body?: string }) {
  return (
    <div className="container max-w-lg py-20 text-center">
      <Construction className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
      <h1 className="mt-5 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {body ?? 'This section is part of a later build round.'}
      </p>
      <Button className="mt-7" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container max-w-lg py-24 text-center">
      <div className="font-display text-6xl font-extrabold text-brand-600">404</div>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or has moved.
      </p>
      <Button className="mt-7" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
