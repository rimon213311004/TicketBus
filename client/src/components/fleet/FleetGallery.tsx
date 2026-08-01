import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { fetchFleetPhotos } from '@/services';
import { fadeUp, stagger } from '@/animations/variants';
import { Skeleton } from '@/components/ui/Skeleton';

interface FleetGalleryProps {
  /** Cap the grid; omit to show every photo in the fleet. */
  limit?: number;
}

/**
 * Every coach photo the seeder found in bus_image/, so a newly added picture
 * shows up here without any code change.
 */
export function FleetGallery({ limit }: FleetGalleryProps) {
  const { data: photos, isLoading } = useQuery({
    queryKey: ['fleet-photos'],
    queryFn: fetchFleetPhotos,
  });

  if (isLoading) {
    return (
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: limit ?? 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) return null;

  const shown = limit ? photos.slice(0, limit) : photos;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {shown.map((photo) => (
        <motion.figure
          key={photo.url}
          variants={fadeUp}
          whileHover={{ y: -4 }}
          className="card group relative overflow-hidden"
        >
          <img
            src={photo.url}
            alt={`${photo.operator} coach`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-slate-950/85 to-transparent p-4 text-white">
            <span className="text-sm font-semibold leading-tight">{photo.operator}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-warning text-warning" aria-hidden />
              {photo.rating.toFixed(1)}
            </span>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
