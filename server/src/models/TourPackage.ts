import { Schema, model, Document, Types } from 'mongoose';
import { BusType, AcType } from '../constants';

export const TOUR_CATEGORIES = [
  'Beach',
  'Hill Track',
  'Forest',
  'Heritage',
  'Tea Garden',
  'River & Haor',
  'Island',
] as const;
export type TourCategory = (typeof TOUR_CATEGORIES)[number];

export interface ITourItineraryDay {
  day: number;
  title: string;
  detail: string;
}

export interface ITourPackage extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  slug: string;
  /** District the tour is centred on — links straight into bus search. */
  destination: string;
  destinationBn: string;
  division: string;
  category: TourCategory;
  summary: string;
  description: string;
  highlights: string[];
  itinerary: ITourItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  /** Struck-through price, when the package is discounted. */
  oldPrice?: number;
  departureCity: string;
  departureDays: string[];
  bestSeason: string;
  groupSize: string;
  /** The coach that runs this tour. */
  operator: Types.ObjectId;
  coachLabel: string;
  busType: BusType;
  acType: AcType;
  seats: number;
  coverImage?: string;
  images: string[];
  rating: number;
  totalReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itinerarySchema = new Schema<ITourItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { _id: false },
);

const tourPackageSchema = new Schema<ITourPackage>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    destination: { type: String, required: true, index: true },
    destinationBn: { type: String, required: true },
    division: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    itinerary: { type: [itinerarySchema], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    pricePerPerson: { type: Number, required: true },
    oldPrice: Number,
    departureCity: { type: String, required: true },
    departureDays: { type: [String], default: [] },
    bestSeason: { type: String, required: true },
    groupSize: { type: String, required: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    coachLabel: { type: String, required: true },
    busType: { type: String, required: true },
    acType: { type: String, required: true },
    seats: { type: Number, required: true },
    coverImage: String,
    images: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const TourPackage = model<ITourPackage>('TourPackage', tourPackageSchema);
