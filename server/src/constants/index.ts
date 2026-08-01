export const USER_ROLES = ['customer', 'operator', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BUS_TYPES = ['Economy', 'Business', 'Executive', 'Sleeper', 'Double Decker'] as const;
export type BusType = (typeof BUS_TYPES)[number];

export const BUS_TYPE_CONFIG: Record<BusType, { seats: number; layout: string; columns: number }> = {
  Economy: { seats: 40, layout: '2x2', columns: 4 },
  Business: { seats: 36, layout: '2x2', columns: 4 },
  Executive: { seats: 32, layout: '2x2', columns: 4 },
  Sleeper: { seats: 24, layout: 'Cabin', columns: 4 },
  'Double Decker': { seats: 50, layout: '2 Levels', columns: 4 },
};

export const AC_TYPES = ['AC', 'Non-AC'] as const;
export type AcType = (typeof AC_TYPES)[number];

export const AMENITIES = [
  'Air Conditioning',
  'Wi-Fi',
  'USB Charging',
  'Mobile Charging',
  'Blankets',
  'Drinking Water',
  'Snacks',
  'GPS Tracking',
  'CCTV',
  'Reading Light',
  'Reclining Seats',
  'Emergency Exit',
] as const;
export type Amenity = (typeof AMENITIES)[number];

export const BOOKING_STATUSES = [
  'PENDING_PAYMENT',
  'AWAITING_VERIFICATION',
  'CONFIRMED',
  'CANCELLED',
  'EXPIRED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ['bkash', 'nagad', 'rocket', 'bank', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ONLINE_PAYMENT_METHODS: PaymentMethod[] = ['bkash', 'nagad', 'rocket', 'bank'];

export const PAYMENT_STATUSES = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SEAT_STATUSES = ['available', 'held', 'booked'] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

/** How long a seat stays held during web checkout. */
export const CHECKOUT_HOLD_MINUTES = 15;
/** Max hold for a counter-cash reservation. */
export const CASH_HOLD_HOURS = 6;
/** Cash reservations always expire at least this long before departure. */
export const CASH_HOLD_CUTOFF_HOURS_BEFORE_DEPARTURE = 2;
