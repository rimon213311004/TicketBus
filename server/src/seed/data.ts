import { Amenity } from '../constants';

export interface OperatorSeed {
  code: string;
  name: string;
  slug: string;
  /** Photo used for the operator card and its AC coaches. */
  image: string;
  /** Photo used for this operator's Non-AC coaches. */
  nonAcImage: string;
  /** Photo used for this operator's sleeper coaches. */
  sleeperImage: string;
  rating: number;
  /** Extra gallery shots shown on the fleet page. */
  gallery?: string[];
}

/**
 * Every operator now runs all three modes — AC, Non-AC and Sleeper — so the
 * hasAc/hasNonAc/hasSleeper flags are set for all of them in the seeder. Where
 * we do not have a dedicated photo for a mode, an existing coach photo is
 * reused rather than leaving the card blank.
 */
export const OPERATORS: OperatorSeed[] = [
  { code: 'OP001', name: 'Green Line Paribahan', slug: 'green-line-paribahan', image: 'green.jpg', nonAcImage: 'Gemini_Generated_Image_d9yk99d9yk99d9yk.png', sleeperImage: 'goldenlineac.jpg', rating: 4.8 },
  { code: 'OP002', name: 'Hanif Enterprise', slug: 'hanif-enterprise', image: 'hanifvolvo.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'hanifvolvo.jpg', rating: 4.6 },
  { code: 'OP003', name: 'Shohag Paribahan', slug: 'shohag-paribahan', image: 'Shogah.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'sbsuper deluxac.jpg', rating: 4.5 },
  { code: 'OP004', name: 'Shyamoli NR Travels', slug: 'shyamoli-nr-travels', image: 'shyamoli.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'goldenlineac.jpg', rating: 4.5 },
  { code: 'OP005', name: 'Ena Transport', slug: 'ena-transport', image: 'ena.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'orinac.jpg', rating: 4.7 },
  { code: 'OP006', name: 'S Alam Service', slug: 's-alam-service', image: 'shah.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'marsa.jpg', rating: 4.4 },
  { code: 'OP007', name: 'Saintmartin Paribahan', slug: 'saintmartin-paribahan', image: 'Akota.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'goldenlineac.jpg', rating: 4.6 },
  { code: 'OP008', name: 'Desh Travels', slug: 'desh-travels', image: 'Desh.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'sbsuper deluxac.jpg', rating: 4.3 },
  { code: 'OP009', name: 'Royal Coach', slug: 'royal-coach', image: 'grammen.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'marsa.jpg', rating: 4.4 },
  { code: 'OP010', name: 'TR Travels', slug: 'tr-travels', image: 'marsa.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'goldenlineac.jpg', rating: 4.4 },
  { code: 'OP011', name: 'Varendra Express', slug: 'varendra-express', image: 'varendra express.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'sbsuper deluxac.jpg', rating: 4.7 },
  { code: 'OP012', name: 'Golden Line Paribahan', slug: 'golden-line-paribahan', image: 'goldenlineac.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'goldenlineac.jpg', rating: 4.4 },
  { code: 'OP013', name: 'Orine Express', slug: 'orine-express', image: 'orinac.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'orinac.jpg', rating: 4.3 },
  { code: 'OP014', name: 'Shanti Poribahan', slug: 'shanti-poribahan', image: 'shanti poribohon.jpg', nonAcImage: 'Hanifnonac..jpg', sleeperImage: 'marsa.jpg', rating: 4.5 },
  { code: 'OP015', name: 'SB Super Deluxe', slug: 'sb-super-deluxe', image: 'sbsuper deluxac.jpg', nonAcImage: 'orin.jpg', sleeperImage: 'sbsuper deluxac.jpg', rating: 4.4 },
];

/** Picks the right photo for a coach given its fleet class. */
export function imageForFleet(operator: OperatorSeed, fleetKey: string): string {
  if (fleetKey === 'nonac-economy') return operator.nonAcImage;
  if (fleetKey === 'ac-sleeper') return operator.sleeperImage;
  return operator.image;
}

export const AC_AMENITIES: Amenity[] = [
  'Air Conditioning',
  'Wi-Fi',
  'USB Charging',
  'Mobile Charging',
  'Blankets',
  'Drinking Water',
  'GPS Tracking',
  'CCTV',
  'Reading Light',
  'Reclining Seats',
  'Emergency Exit',
];

export const NON_AC_AMENITIES: Amenity[] = [
  'Drinking Water',
  'Reading Light',
  'Emergency Exit',
  'Reclining Seats',
  'CCTV',
];

export const SLEEPER_AMENITIES: Amenity[] = [
  'Air Conditioning',
  'Blankets',
  'Wi-Fi',
  'USB Charging',
  'Mobile Charging',
  'Drinking Water',
  'Snacks',
  'GPS Tracking',
  'CCTV',
  'Reading Light',
  'Emergency Exit',
];

export function amenitiesForFleet(fleetKey: string): Amenity[] {
  if (fleetKey === 'nonac-economy') return NON_AC_AMENITIES;
  if (fleetKey === 'ac-sleeper') return SLEEPER_AMENITIES;
  return AC_AMENITIES;
}

/** How many days of trips the seed generates. */
export const TRIP_DAYS = 30;
