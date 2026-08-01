import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const searchTripsSchema = z.object({
  query: z.object({
    from: z.string().min(1, 'Origin is required'),
    to: z.string().min(1, 'Destination is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    acType: z.enum(['AC', 'Non-AC']).optional(),
    busType: z.string().optional(),
    operator: objectId.optional(),
    minFare: z.coerce.number().min(0).optional(),
    maxFare: z.coerce.number().min(0).optional(),
    sort: z.enum(['departure', 'fare_asc', 'fare_desc', 'rating']).optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
  }),
});

export const tripIdSchema = z.object({
  params: z.object({ tripId: objectId }),
});
