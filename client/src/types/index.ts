export type UserRole = 'customer' | 'operator' | 'admin';
export type BusType = 'Economy' | 'Business' | 'Executive' | 'Sleeper' | 'Double Decker';
export type AcType = 'AC' | 'Non-AC';
export type Gender = 'male' | 'female' | 'other';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REFUNDED';
export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_VERIFICATION'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED';
export type SeatStatus = 'available' | 'held' | 'booked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface Operator {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  gallery?: string[];
  rating: number;
  totalReviews: number;
  description?: string;
}

export interface DivisionStop {
  name: string;
  bn: string;
  isHq: boolean;
  /** Cities reachable from here on a direct coach. */
  destinations: number;
  terminals: number;
}

export interface Division {
  name: string;
  bn: string;
  hq: string;
  /** Hex accent used for the division card. */
  accent: string;
  districts: DivisionStop[];
  touristStops: DivisionStop[];
  districtCount: number;
  routeCount: number;
}

export interface DivisionsResult {
  divisions: Division[];
  totalDistricts: number;
  totalRoutes: number;
}

export interface FleetPhoto {
  url: string;
  operator: string;
  operatorSlug: string;
  rating: number;
}

export interface RouteInfo {
  _id: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMinutes: number;
}

export interface Point {
  _id: string;
  name: string;
  city: string;
  minutesBeforeDeparture?: number;
}

export interface BusInfo {
  _id: string;
  name: string;
  registrationNumber: string;
  amenities: string[];
  images: string[];
  layout: string;
}

export interface Trip {
  _id: string;
  code: string;
  operator: Operator;
  route: RouteInfo;
  bus: BusInfo;
  departureTime: string;
  arrivalTime: string;
  departureLabel: string;
  arrivalLabel: string;
  busType: BusType;
  acType: AcType;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  boardingPoints: Point[];
  droppingPoints: Point[];
}

export interface Seat {
  seatNumber: string;
  row: number;
  column: number;
  status: SeatStatus;
  heldByMe?: boolean;
}

export interface SeatMap {
  tripId: string;
  fare: number;
  totalSeats: number;
  columns: number;
  availableCount: number;
  seats: Seat[];
}

export interface Passenger {
  name: string;
  age?: number;
  gender: Gender;
  seatNumber: string;
}

export interface Payment {
  _id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  senderNumber?: string;
  trxId?: string;
  receiverNumber?: string;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  trip: Pick<Trip, '_id' | 'departureLabel' | 'arrivalLabel' | 'departureTime' | 'busType' | 'acType' | 'fare'>;
  operator: Pick<Operator, '_id' | 'name' | 'logo' | 'rating'>;
  route: RouteInfo;
  seatNumbers: string[];
  passengers: Passenger[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  boardingPoint: Point;
  droppingPoint: Point;
  farePerSeat: number;
  totalAmount: number;
  serviceCharge: number;
  payableAmount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  holdExpiresAt?: string | null;
  journeyDate: string;
  createdAt: string;
  payment: Payment | null;
  receiverNumber?: string;
}

/** A submitted payment awaiting admin review, as returned by GET /payments/pending. */
export interface PendingPayment {
  _id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  senderNumber?: string;
  trxId?: string;
  receiverNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  submittedAt?: string;
  booking: {
    _id: string;
    bookingCode: string;
    seatNumbers: string[];
    payableAmount: number;
    journeyDate: string;
    status: BookingStatus;
  } | null;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
}

export interface AdminStats {
  totalSales: number;
  verifiedPayments: number;
  totalTickets: number;
  activeBuses: number;
  totalBuses: number;
  activeTrips: number;
  todayTrips: number;
  trips: {
    _id: string;
    code: string;
    departureTime: string;
    arrivalTime: string;
    departureLabel: string;
    arrivalLabel: string;
    busType: BusType;
    acType: AcType;
    operator: { _id: string; name: string };
    route: { _id: string; from: string; to: string };
    bus: { _id: string; name: string; registrationNumber: string; images: string[] };
    status: 'READY' | 'BOARDING' | 'ON_TRIP';
    progress: number;
    location: string;
    boardingAt: string;
    boardingPoints: { _id: string; name: string; city: string; address: string; minutesBeforeDeparture?: number; lat: number; lng: number }[];
  }[];
}

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  number?: string;
  accountName?: string;
  type: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TripSearchResult {
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
}
