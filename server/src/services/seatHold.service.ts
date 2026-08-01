import { Types } from 'mongoose';
import { SeatHold, Trip } from '../models';
import { AppError } from '../utils/AppError';
import {
  CHECKOUT_HOLD_MINUTES,
  CASH_HOLD_HOURS,
  CASH_HOLD_CUTOFF_HOURS_BEFORE_DEPARTURE,
} from '../constants';

export function checkoutHoldExpiry(): Date {
  return new Date(Date.now() + CHECKOUT_HOLD_MINUTES * 60_000);
}

/** Cash reservations last 6 hours, but never past 2 hours before departure. */
export function cashHoldExpiry(departureTime: Date): Date {
  const sixHours = Date.now() + CASH_HOLD_HOURS * 3_600_000;
  const cutoff = departureTime.getTime() - CASH_HOLD_CUTOFF_HOURS_BEFORE_DEPARTURE * 3_600_000;
  return new Date(Math.min(sixHours, cutoff));
}

/**
 * Claims seats for a user. The unique {trip, seatNumber} index is the real guard:
 * on a race, exactly one inserter wins and the loser gets a duplicate-key error.
 * Any partial success is rolled back so the caller never holds a subset.
 */
export async function holdSeats(
  tripId: string,
  seatNumbers: string[],
  userId: string,
  expiresAt: Date = checkoutHoldExpiry(),
) {
  const trip = await Trip.findById(tripId).select('bookedSeats totalSeats departureTime').lean();
  if (!trip) throw AppError.notFound('Trip not found');

  if (trip.departureTime.getTime() <= Date.now()) {
    throw AppError.badRequest('This trip has already departed');
  }

  const alreadySold = seatNumbers.filter((s) => trip.bookedSeats.includes(s));
  if (alreadySold.length > 0) {
    throw AppError.conflict(`Seat ${alreadySold.join(', ')} is already booked`);
  }

  // Reclaim any seats this same user still holds, so re-entering checkout works.
  await SeatHold.deleteMany({ trip: trip._id, seatNumber: { $in: seatNumbers }, user: userId });

  const granted: string[] = [];
  try {
    for (const seatNumber of seatNumbers) {
      await SeatHold.create({ trip: trip._id, seatNumber, user: userId, expiresAt });
      granted.push(seatNumber);
    }
  } catch (err) {
    if (granted.length > 0) {
      await SeatHold.deleteMany({ trip: trip._id, seatNumber: { $in: granted }, user: userId });
    }
    if (isDuplicateKey(err)) {
      throw AppError.conflict('Someone just took one of those seats. Please pick again.');
    }
    throw err;
  }

  return { tripId, seatNumbers: granted, expiresAt };
}

export async function releaseSeats(tripId: string, seatNumbers: string[], userId: string) {
  await SeatHold.deleteMany({
    trip: new Types.ObjectId(tripId),
    seatNumber: { $in: seatNumbers },
    user: userId,
    booking: null,
  });
}

/** Confirms the caller still owns holds on every listed seat. */
export async function assertHoldsOwned(tripId: string, seatNumbers: string[], userId: string) {
  const holds = await SeatHold.find({
    trip: new Types.ObjectId(tripId),
    seatNumber: { $in: seatNumbers },
    user: userId,
  })
    .select('seatNumber')
    .lean();

  const owned = new Set(holds.map((h) => h.seatNumber));
  const missing = seatNumbers.filter((s) => !owned.has(s));
  if (missing.length > 0) {
    throw AppError.conflict(
      `Your hold on seat ${missing.join(', ')} expired. Please select your seats again.`,
    );
  }
}

/** Links holds to a booking and re-dates them; null expiry makes the hold permanent. */
export async function attachHoldsToBooking(
  tripId: string,
  seatNumbers: string[],
  userId: string,
  bookingId: Types.ObjectId,
  expiresAt: Date | null,
) {
  await SeatHold.updateMany(
    { trip: new Types.ObjectId(tripId), seatNumber: { $in: seatNumbers }, user: userId },
    { $set: { booking: bookingId, expiresAt } },
  );
}

export async function releaseBookingHolds(bookingId: Types.ObjectId) {
  await SeatHold.deleteMany({ booking: bookingId });
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}
