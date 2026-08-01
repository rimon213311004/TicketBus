import { TourPackage, Operator } from '../models';
import { AppError } from '../utils/AppError';
import { TOUR_CATEGORIES } from '../models/TourPackage';

export interface TourListInput {
  category?: string;
  division?: string;
  destination?: string;
  maxPrice?: number;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'duration';
}

const SORT_MAP = {
  featured: { isFeatured: -1 as const, rating: -1 as const },
  price_asc: { pricePerPerson: 1 as const },
  price_desc: { pricePerPerson: -1 as const },
  rating: { rating: -1 as const },
  duration: { durationDays: 1 as const },
};

export async function listTours(input: TourListInput = {}) {
  const filter: Record<string, unknown> = { isActive: true };
  if (input.category) filter.category = input.category;
  if (input.division) filter.division = input.division;
  if (input.destination) filter.destination = input.destination;
  if (input.maxPrice !== undefined) filter.pricePerPerson = { $lte: input.maxPrice };

  const tours = await TourPackage.find(filter)
    .sort(SORT_MAP[input.sort ?? 'featured'])
    .populate('operator', 'name slug logo rating')
    .lean();

  return { tours, total: tours.length, categories: [...TOUR_CATEGORIES] };
}

export async function getTourBySlug(slug: string) {
  const tour = await TourPackage.findOne({ slug, isActive: true })
    .populate('operator', 'name slug logo rating totalReviews description')
    .lean();

  if (!tour) throw AppError.notFound('Tour package not found');

  const related = await TourPackage.find({
    _id: { $ne: tour._id },
    isActive: true,
    $or: [{ category: tour.category }, { division: tour.division }],
  })
    .limit(3)
    .select('title slug summary destination pricePerPerson durationDays durationNights coverImage rating category')
    .lean();

  return { tour, related };
}

export async function listTourOperators() {
  return Operator.find({ isActive: true }).select('name slug logo rating').sort({ rating: -1 }).lean();
}
