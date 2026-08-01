import { Types } from 'mongoose';
import { Booking, Payment, Trip, Bus, BoardingPoint, DroppingPoint, IBooking } from '../models';
import { AppError } from '../utils/AppError';
import { generateBookingCode } from '../utils/bookingCode';
import { env } from '../config/env';
import { PaymentMethod, Gender, ONLINE_PAYMENT_METHODS } from '../constants';
import * as seatHoldService from './seatHold.service';

export interface CreateBookingInput {
  tripId: string;
  seatNumbers: string[];
  passengers: { name: string; age?: number; gender: Gender; seatNumber: string }[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  boardingPointId: string;
  droppingPointId: string;
  paymentMethod: PaymentMethod;
}

const SERVICE_CHARGE_PER_SEAT = 20;

export async function createBooking(userId: string, input: CreateBookingInput) {
  const trip = await Trip.findById(input.tripId).select(
    'fare bookedSeats departureTime operator route totalSeats',
  );
  if (!trip) throw AppError.notFound('Trip not found');

  if (trip.departureTime.getTime() <= Date.now()) {
    throw AppError.badRequest('This trip has already departed');
  }

  const seatSet = new Set(input.seatNumbers);
  if (seatSet.size !== input.seatNumbers.length) {
    throw AppError.badRequest('Duplicate seats in selection');
  }

  const passengerSeats = input.passengers.map((p) => p.seatNumber);
  const mismatch =
    passengerSeats.length !== input.seatNumbers.length ||
    passengerSeats.some((s) => !seatSet.has(s));
  if (mismatch) {
    throw AppError.badRequest('Each selected seat needs exactly one passenger');
  }

  await seatHoldService.assertHoldsOwned(input.tripId, input.seatNumbers, userId);

  const [boarding, dropping] = await Promise.all([
    BoardingPoint.findById(input.boardingPointId).lean(),
    DroppingPoint.findById(input.droppingPointId).lean(),
  ]);
  if (!boarding) throw AppError.badRequest('Invalid boarding point');
  if (!dropping) throw AppError.badRequest('Invalid dropping point');

  const seatCount = input.seatNumbers.length;
  const totalAmount = trip.fare * seatCount;
  const serviceCharge = SERVICE_CHARGE_PER_SEAT * seatCount;
  const payableAmount = totalAmount + serviceCharge;

  const isCash = input.paymentMethod === 'cash';
  const holdExpiresAt = isCash ? seatHoldService.cashHoldExpiry(trip.departureTime) : null;

  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    user: userId,
    trip: trip._id,
    operator: trip.operator,
    route: trip.route,
    seatNumbers: input.seatNumbers,
    passengers: input.passengers,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    boardingPoint: boarding._id,
    droppingPoint: dropping._id,
    farePerSeat: trip.fare,
    totalAmount,
    serviceCharge,
    discount: 0,
    payableAmount,
    paymentMethod: input.paymentMethod,
    status: 'PENDING_PAYMENT',
    holdExpiresAt,
    journeyDate: trip.departureTime,
  });

  // Cash reservations keep a timed hold; online checkout keeps the 15-minute hold
  // until a TrxID is submitted, at which point it becomes permanent.
  await seatHoldService.attachHoldsToBooking(
    input.tripId,
    input.seatNumbers,
    userId,
    booking._id,
    isCash ? holdExpiresAt : seatHoldService.checkoutHoldExpiry(),
  );

  await Payment.create({
    booking: booking._id,
    user: userId,
    method: input.paymentMethod,
    amount: payableAmount,
    status: 'PENDING',
    receiverNumber: isCash ? undefined : env.payment.receiverNumber,
  });

  return getBookingById(booking._id.toString(), userId);
}

export async function submitPayment(
  bookingId: string,
  userId: string,
  input: {
    method: PaymentMethod;
    senderNumber: string;
    trxId: string;
    amount: number;
    bankName?: string;
    bankAccountName?: string;
  },
) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound('Booking not found');
  if (booking.user.toString() !== userId) throw AppError.forbidden();

  if (booking.status === 'CONFIRMED') {
    throw AppError.badRequest('This booking is already confirmed');
  }
  if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
    throw AppError.badRequest('This booking is no longer active');
  }
  if (!ONLINE_PAYMENT_METHODS.includes(input.method)) {
    throw AppError.badRequest('Choose bKash, Nagad, Rocket or bank transfer');
  }
  if (input.amount !== booking.payableAmount) {
    throw AppError.badRequest(`Amount must be exactly BDT ${booking.payableAmount}`);
  }

  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
  if (!payment) throw AppError.notFound('Payment record not found');

  payment.method = input.method;
  payment.senderNumber = input.senderNumber;
  payment.trxId = input.trxId.toUpperCase();
  payment.receiverNumber = env.payment.receiverNumber;
  payment.bankName = input.bankName;
  payment.bankAccountName = input.bankAccountName;
  payment.status = 'SUBMITTED';
  payment.submittedAt = new Date();
  payment.rejectionReason = undefined;
  payment.rejectedAt = undefined;

  try {
    await payment.save();
  } catch (err) {
    if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
      throw AppError.conflict('This transaction ID has already been used');
    }
    throw err;
  }

  booking.status = 'AWAITING_VERIFICATION';
  booking.paymentMethod = input.method;
  booking.holdExpiresAt = null;
  await booking.save();

  // Seats stay claimed indefinitely while an admin reviews the transaction.
  await seatHoldService.attachHoldsToBooking(
    booking.trip.toString(),
    booking.seatNumbers,
    userId,
    booking._id,
    null,
  );

  return getBookingById(booking._id.toString(), userId);
}

/** Admin approves a submitted transaction, or counter staff collect cash. */
export async function verifyPayment(paymentId: string, adminId: string, notes?: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw AppError.notFound('Payment not found');
  if (payment.status === 'VERIFIED') throw AppError.badRequest('Already verified');
  if (payment.status !== 'SUBMITTED') {
    throw AppError.badRequest('Only submitted payments can be verified');
  }
  if (!payment.trxId || !payment.senderNumber) {
    throw AppError.badRequest('Payment is missing transaction details');
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking) throw AppError.notFound('Booking not found');
  if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
    throw AppError.badRequest('This booking is no longer active');
  }
  if (payment.amount !== booking.payableAmount) {
    throw AppError.badRequest('Payment amount does not match the booking total');
  }

  const trip = await Trip.findById(booking.trip);
  if (!trip) throw AppError.notFound('Trip not found');

  const conflict = booking.seatNumbers.filter((s) => trip.bookedSeats.includes(s));
  if (conflict.length > 0) {
    throw AppError.conflict(`Seat ${conflict.join(', ')} was already sold on another booking`);
  }

  payment.status = 'VERIFIED';
  payment.verifiedAt = new Date();
  payment.verifiedBy = new Types.ObjectId(adminId);
  if (notes) payment.notes = notes;
  if (payment.method === 'cash') payment.collectedBy = new Types.ObjectId(adminId);
  await payment.save();

  // Seats move onto the trip itself; the hold becomes permanent.
  trip.bookedSeats.push(...booking.seatNumbers);
  await trip.save();

  booking.status = 'CONFIRMED';
  booking.confirmedAt = new Date();
  booking.holdExpiresAt = null;
  await booking.save();

  await seatHoldService.attachHoldsToBooking(
    booking.trip.toString(),
    booking.seatNumbers,
    booking.user.toString(),
    booking._id,
    null,
  );

  return getBookingById(booking._id.toString());
}

export async function rejectPayment(paymentId: string, adminId: string, reason: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw AppError.notFound('Payment not found');
  if (payment.status === 'VERIFIED') {
    throw AppError.badRequest('Cannot reject an already verified payment');
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking) throw AppError.notFound('Booking not found');

  payment.status = 'REJECTED';
  payment.rejectedAt = new Date();
  payment.rejectionReason = reason;
  payment.verifiedBy = new Types.ObjectId(adminId);
  // Free the transaction ID so the customer can resubmit a corrected one.
  payment.trxId = undefined;
  await payment.save();

  booking.status = 'PENDING_PAYMENT';
  const holdExpiry = seatHoldService.checkoutHoldExpiry();
  booking.holdExpiresAt = holdExpiry;
  await booking.save();

  await seatHoldService.attachHoldsToBooking(
    booking.trip.toString(),
    booking.seatNumbers,
    booking.user.toString(),
    booking._id,
    holdExpiry,
  );

  return getBookingById(booking._id.toString());
}

export async function cancelBooking(bookingId: string, userId: string, reason?: string) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound('Booking not found');
  if (booking.user.toString() !== userId) throw AppError.forbidden();
  if (booking.status === 'CANCELLED') throw AppError.badRequest('Already cancelled');

  if (booking.status === 'CONFIRMED') {
    const trip = await Trip.findById(booking.trip);
    if (trip) {
      trip.bookedSeats = trip.bookedSeats.filter((s) => !booking.seatNumbers.includes(s));
      await trip.save();
    }
  }

  booking.status = 'CANCELLED';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  booking.holdExpiresAt = null;
  await booking.save();

  await seatHoldService.releaseBookingHolds(booking._id);
  await Payment.updateMany(
    { booking: booking._id, status: { $in: ['PENDING', 'SUBMITTED'] } },
    { $set: { status: 'REJECTED', rejectionReason: 'Booking cancelled' }, $unset: { trxId: '' } },
  );

  return getBookingById(booking._id.toString(), userId);
}

const BOOKING_POPULATE = [
  { path: 'trip', select: 'code departureTime arrivalTime departureLabel arrivalLabel busType acType fare' },
  { path: 'operator', select: 'name slug logo rating' },
  { path: 'route', select: 'from to distanceKm durationMinutes' },
  { path: 'boardingPoint', select: 'name city minutesBeforeDeparture' },
  { path: 'droppingPoint', select: 'name city' },
];

export async function getBookingById(bookingId: string, userId?: string) {
  const booking = await Booking.findById(bookingId).populate(BOOKING_POPULATE).lean();
  if (!booking) throw AppError.notFound('Booking not found');
  if (userId && booking.user.toString() !== userId) throw AppError.forbidden();

  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 }).lean();
  return { ...booking, payment, receiverNumber: env.payment.receiverNumber };
}

export async function getBookingByCode(code: string) {
  const booking = await Booking.findOne({ bookingCode: code.toUpperCase() })
    .populate(BOOKING_POPULATE)
    .lean();
  if (!booking) throw AppError.notFound('Booking not found');
  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 }).lean();
  return { ...booking, payment };
}

export async function listMyBookings(userId: string, status?: string) {
  const filter: Record<string, unknown> = { user: userId };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate(BOOKING_POPULATE)
    .lean();

  const payments = await Payment.find({ booking: { $in: bookings.map((b) => b._id) } })
    .sort({ createdAt: -1 })
    .lean();

  const paymentByBooking = new Map<string, (typeof payments)[number]>();
  for (const p of payments) {
    const key = p.booking.toString();
    if (!paymentByBooking.has(key)) paymentByBooking.set(key, p);
  }

  return bookings.map((b) => ({ ...b, payment: paymentByBooking.get(b._id.toString()) ?? null }));
}

/** Admin queue of transactions waiting on manual verification. */
export async function listPendingPayments() {
  return Payment.find({ status: 'SUBMITTED' })
    .sort({ submittedAt: 1 })
    .populate({ path: 'booking', select: 'bookingCode seatNumbers payableAmount journeyDate status' })
    .populate({ path: 'user', select: 'name email phone' })
    .lean();
}

/** Operational figures for the admin dashboard. All totals come from verified data. */
export async function getAdminStats() {
  const now = new Date();
  const lookback = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const lookahead = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [sales, tickets, activeBuses, totalBuses, activeTrips, operationalTrips, todayTrips] = await Promise.all([
    Payment.aggregate<{ total: number; count: number }>([
      { $match: { status: 'VERIFIED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate<{ total: number }>([
      { $match: { status: 'CONFIRMED' } },
      { $unwind: '$seatNumbers' },
      { $count: 'total' },
    ]),
    Bus.countDocuments({ isActive: true }),
    Bus.countDocuments({}),
    Trip.find({ departureTime: { $lte: now }, arrivalTime: { $gt: now }, isActive: true })
      .select('code departureLabel arrivalLabel busType acType operator route bus')
      .populate({ path: 'operator', select: 'name' })
      .populate({ path: 'route', select: 'from to' })
      .populate({ path: 'bus', select: 'name registrationNumber images' })
      .lean(),
    Trip.find({ departureTime: { $gte: lookback, $lte: lookahead }, arrivalTime: { $gt: now }, isActive: true })
      .select('code departureTime arrivalTime departureLabel arrivalLabel busType acType operator route bus boardingPoints')
      .sort({ departureTime: 1 })
      .limit(40)
      .populate({ path: 'operator', select: 'name' })
      .populate({ path: 'route', select: 'from to durationMinutes' })
      .populate({ path: 'bus', select: 'name registrationNumber images' })
      .populate({ path: 'boardingPoints', select: 'name city address minutesBeforeDeparture lat lng' })
      .lean(),
    Trip.countDocuments({ departureTime: { $gte: startOfDay, $lt: endOfDay }, isActive: true }),
  ]);

  const trips = operationalTrips.map((trip) => {
    const route = trip.route as unknown as { from: string; to: string; durationMinutes: number };
    const boardingPoints = trip.boardingPoints as unknown as Array<{
      name: string;
      city: string;
      address: string;
      minutesBeforeDeparture?: number;
      lat: number;
      lng: number;
    }>;
    const boardingLead = Math.max(
      15,
      ...(boardingPoints ?? []).map((point) => point.minutesBeforeDeparture ?? 20),
    );
    const boardingAt = new Date(trip.departureTime.getTime() - boardingLead * 60_000);
    const isReady = now < boardingAt;
    const isBoarding = now >= boardingAt && now < trip.departureTime;
    const progress = isReady || isBoarding
      ? 0
      : Math.min(100, Math.round(((now.getTime() - trip.departureTime.getTime()) /
          (trip.arrivalTime.getTime() - trip.departureTime.getTime())) * 100));
    const status = isReady ? 'READY' : isBoarding ? 'BOARDING' : 'ON_TRIP';
    const location = isReady
      ? route.from
      : isBoarding
        ? boardingPoints?.[0]?.name ?? route.from
        : `Between ${route.from} and ${route.to}`;

    return { ...trip, status, progress, location, boardingAt };
  });

  return {
    totalSales: sales[0]?.total ?? 0,
    verifiedPayments: sales[0]?.count ?? 0,
    totalTickets: tickets[0]?.total ?? 0,
    activeBuses,
    totalBuses,
    activeTrips: activeTrips.length,
    todayTrips,
    trips,
  };
}

export type BookingDoc = IBooking;
