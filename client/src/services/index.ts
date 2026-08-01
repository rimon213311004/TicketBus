import { api } from '@/lib/api';
import type {
  ApiResponse,
  AdminStats,
  Booking,
  DivisionsResult,
  FleetPhoto,
  Operator,
  PaymentMethod,
  PaymentMethodInfo,
  Passenger,
  PendingPayment,
  RouteInfo,
  SeatMap,
  Trip,
  TripSearchResult,
  User,
} from '@/types';

/* ---------- auth ---------- */

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
    '/auth/login',
    { email, password },
  );
  return data.data;
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
    '/auth/register',
    input,
  );
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function fetchMe() {
  const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return data.data.user;
}

export async function updateProfile(input: { name?: string; phone?: string }) {
  const { data } = await api.patch<ApiResponse<{ user: User }>>('/auth/me', input);
  return data.data.user;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  await api.post('/auth/change-password', input);
}

/* ---------- catalog ---------- */

export async function fetchCities() {
  const { data } = await api.get<ApiResponse<{ from: string[]; to: string[] }>>('/catalog/cities');
  return data.data;
}

export async function fetchRoutes() {
  const { data } = await api.get<ApiResponse<{ routes: RouteInfo[] }>>('/catalog/routes');
  return data.data.routes;
}

export async function fetchOperators() {
  const { data } = await api.get<ApiResponse<{ operators: Operator[] }>>('/catalog/operators');
  return data.data.operators;
}

export async function fetchDivisions() {
  const { data } = await api.get<ApiResponse<DivisionsResult>>('/catalog/divisions');
  return data.data;
}

export async function fetchFleetPhotos() {
  const { data } = await api.get<ApiResponse<{ photos: FleetPhoto[] }>>('/catalog/fleet');
  return data.data.photos;
}

/* ---------- trips ---------- */

export interface TripSearchParams {
  from: string;
  to: string;
  date: string;
  acType?: string;
  busType?: string;
  operator?: string;
  sort?: string;
  minFare?: number;
  maxFare?: number;
}

export async function searchTrips(params: TripSearchParams) {
  const { data } = await api.get<ApiResponse<TripSearchResult>>('/trips/search', { params });
  return data.data;
}

export async function fetchTrip(tripId: string) {
  const { data } = await api.get<ApiResponse<{ trip: Trip }>>(`/trips/${tripId}`);
  return data.data.trip;
}

export async function fetchSeats(tripId: string) {
  const { data } = await api.get<ApiResponse<SeatMap>>(`/trips/${tripId}/seats`);
  return data.data;
}

/* ---------- bookings ---------- */

export async function holdSeats(tripId: string, seatNumbers: string[]) {
  const { data } = await api.post<ApiResponse<{ seatNumbers: string[]; expiresAt: string }>>(
    '/bookings/hold',
    { tripId, seatNumbers },
  );
  return data.data;
}

export async function releaseSeats(tripId: string, seatNumbers: string[]) {
  await api.post('/bookings/release', { tripId, seatNumbers });
}

export interface CreateBookingInput {
  tripId: string;
  seatNumbers: string[];
  passengers: Passenger[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  boardingPointId: string;
  droppingPointId: string;
  paymentMethod: PaymentMethod;
}

export async function createBooking(input: CreateBookingInput) {
  const { data } = await api.post<ApiResponse<{ booking: Booking }>>('/bookings', input);
  return data.data.booking;
}

export async function fetchMyBookings() {
  const { data } = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings');
  return data.data.bookings;
}

export async function fetchBooking(bookingId: string) {
  const { data } = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}`);
  return data.data.booking;
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const { data } = await api.post<ApiResponse<{ booking: Booking }>>(
    `/bookings/${bookingId}/cancel`,
    { reason },
  );
  return data.data.booking;
}

/* ---------- payments ---------- */

export async function fetchPaymentInstructions() {
  const { data } = await api.get<ApiResponse<{ receiverNumber: string; methods: PaymentMethodInfo[] }>>(
    '/payments/instructions',
  );
  return data.data;
}

export interface SubmitPaymentInput {
  method: PaymentMethod;
  senderNumber: string;
  trxId: string;
  amount: number;
  bankName?: string;
  bankAccountName?: string;
}

export async function submitPayment(bookingId: string, input: SubmitPaymentInput) {
  const { data } = await api.post<ApiResponse<{ booking: Booking }>>(
    `/payments/${bookingId}/submit`,
    input,
  );
  return data.data.booking;
}

/* ---------- admin ---------- */

export async function fetchPendingPayments() {
  const { data } = await api.get<ApiResponse<{ payments: PendingPayment[] }>>('/payments/pending');
  return data.data.payments;
}

export async function fetchAdminStats() {
  const { data } = await api.get<ApiResponse<AdminStats>>('/payments/admin-stats');
  return data.data;
}

export async function verifyPayment(paymentId: string, notes?: string) {
  const { data } = await api.post<ApiResponse<{ booking: Booking }>>(
    `/payments/${paymentId}/verify`,
    { notes },
  );
  return data.data.booking;
}

export async function rejectPayment(paymentId: string, reason: string) {
  const { data } = await api.post<ApiResponse<{ booking: Booking }>>(
    `/payments/${paymentId}/reject`,
    { reason },
  );
  return data.data.booking;
}

/* ---------- tickets ---------- */

export async function downloadTicket(bookingId: string, bookingCode: string) {
  const response = await api.get(`/tickets/${bookingId}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bookingCode}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
