import { Types } from 'mongoose';
import { Trip, Route, SeatHold, Operator, BoardingPoint } from '../models';
import { AppError } from '../utils/AppError';
import { generateSeatMap } from '../utils/seatMap';
import { BUS_TYPE_CONFIG, BusType } from '../constants';
import { divisionSummary } from '../constants/bangladesh';

export interface TripSearchInput {
  from: string;
  to: string;
  date: string;
  acType?: 'AC' | 'Non-AC';
  busType?: string;
  operator?: string;
  minFare?: number;
  maxFare?: number;
  sort?: 'departure' | 'fare_asc' | 'fare_desc' | 'rating';
  page?: number;
  limit?: number;
}

/** Start and end of the given YYYY-MM-DD in server-local time. */
function dayBounds(date: string): { start: Date; end: Date } {
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

export async function listCities(): Promise<{ from: string[]; to: string[] }> {
  const routes = await Route.find({ isActive: true }).select('from to').lean();
  return {
    from: [...new Set(routes.map((r) => r.from))].sort(),
    to: [...new Set(routes.map((r) => r.to))].sort(),
  };
}

export async function listRoutes() {
  return Route.find({ isActive: true }).sort({ from: 1, to: 1 }).lean();
}

export interface DivisionStopView {
  name: string;
  bn: string;
  isHq: boolean;
  /** Distinct cities reachable from here on a direct coach. */
  destinations: number;
  terminals: number;
}

/**
 * The 8 divisions with their districts and tourist stops, each annotated with
 * how far you can actually get from there. Powers the destinations explorer.
 */
export async function listDivisions() {
  const [byOrigin, terminals] = await Promise.all([
    Route.aggregate<{ _id: string; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: '$from', count: { $sum: 1 } } },
    ]),
    BoardingPoint.aggregate<{ _id: string; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
    ]),
  ]);

  const destinationsByCity = new Map(byOrigin.map((row) => [row._id, row.count]));
  const terminalsByCity = new Map(terminals.map((row) => [row._id, row.count]));

  const annotate = (stop: { name: string; bn: string; isHq: boolean }): DivisionStopView => ({
    ...stop,
    destinations: destinationsByCity.get(stop.name) ?? 0,
    terminals: terminalsByCity.get(stop.name) ?? 0,
  });

  const divisions = divisionSummary().map((division) => {
    const districts = division.districts.map(annotate);
    const touristStops = division.touristStops.map(annotate);
    return {
      ...division,
      districts,
      touristStops,
      districtCount: districts.length,
      routeCount: [...districts, ...touristStops].reduce((sum, s) => sum + s.destinations, 0),
    };
  });

  return {
    divisions,
    totalDistricts: divisions.reduce((sum, d) => sum + d.districtCount, 0),
    totalRoutes: await Route.countDocuments({ isActive: true }),
  };
}

export interface FleetPhoto {
  url: string;
  operator: string;
  operatorSlug: string;
  rating: number;
}

/** Every distinct coach photo across the fleet, for the home-page gallery. */
export async function listFleetPhotos(): Promise<FleetPhoto[]> {
  const operators = await Operator.find({ isActive: true })
    .select('name slug logo gallery rating')
    .sort({ rating: -1 })
    .lean();

  const photos: FleetPhoto[] = [];
  const seen = new Set<string>();

  for (const operator of operators) {
    for (const url of [operator.logo, ...(operator.gallery ?? [])]) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      photos.push({
        url,
        operator: operator.name,
        operatorSlug: operator.slug,
        rating: operator.rating,
      });
    }
  }

  return photos;
}

export async function searchTrips(input: TripSearchInput) {
  const { start, end } = dayBounds(input.date);
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;

  const routes = await Route.find({
    from: new RegExp(`^${escapeRegex(input.from)}$`, 'i'),
    to: new RegExp(`^${escapeRegex(input.to)}$`, 'i'),
    isActive: true,
  }).select('_id');

  if (routes.length === 0) return { trips: [], total: 0, page, limit };

  const filter: Record<string, unknown> = {
    route: { $in: routes.map((r) => r._id) },
    departureTime: { $gte: start, $lte: end },
    isActive: true,
  };

  if (input.acType) filter.acType = input.acType;
  if (input.busType) filter.busType = input.busType;
  if (input.operator) filter.operator = new Types.ObjectId(input.operator);
  if (input.minFare !== undefined || input.maxFare !== undefined) {
    filter.fare = {
      ...(input.minFare !== undefined ? { $gte: input.minFare } : {}),
      ...(input.maxFare !== undefined ? { $lte: input.maxFare } : {}),
    };
  }

  const sortMap = {
    departure: { departureTime: 1 as const },
    fare_asc: { fare: 1 as const },
    fare_desc: { fare: -1 as const },
    rating: { departureTime: 1 as const },
  };

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .sort(sortMap[input.sort ?? 'departure'])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('operator', 'name slug logo rating totalReviews')
      .populate('route', 'from to distanceKm durationMinutes')
      .populate('bus', 'name registrationNumber amenities images layout')
      .lean(),
    Trip.countDocuments(filter),
  ]);

  const withAvailability = await attachAvailability(trips);

  if (input.sort === 'rating') {
    const ratingOf = (t: unknown) =>
      (t as { operator?: { rating?: number } }).operator?.rating ?? 0;
    withAvailability.sort((a, b) => ratingOf(b) - ratingOf(a));
  }

  return { trips: withAvailability, total, page, limit };
}

interface AvailabilityInput {
  _id: Types.ObjectId;
  totalSeats: number;
  bookedSeats: string[];
}

/** Adds availableSeats to each trip using booked seats plus live holds. */
async function attachAvailability<T extends AvailabilityInput>(
  trips: T[],
): Promise<(T & { availableSeats: number })[]> {
  if (trips.length === 0) return [];

  const tripIds = trips.map((t) => t._id);
  const holds = await SeatHold.find({ trip: { $in: tripIds } })
    .select('trip seatNumber')
    .lean();

  const heldByTrip = new Map<string, Set<string>>();
  for (const hold of holds) {
    const key = hold.trip.toString();
    if (!heldByTrip.has(key)) heldByTrip.set(key, new Set());
    heldByTrip.get(key)!.add(hold.seatNumber);
  }

  return trips.map((trip) => {
    const unavailable = new Set([
      ...trip.bookedSeats,
      ...(heldByTrip.get(trip._id.toString()) ?? []),
    ]);
    return { ...trip, availableSeats: trip.totalSeats - unavailable.size };
  });
}

export async function getTripById(tripId: string) {
  const trip = await Trip.findById(tripId)
    .populate('operator', 'name slug logo rating totalReviews description')
    .populate('route', 'from to distanceKm durationMinutes')
    .populate('bus', 'name registrationNumber busType acType amenities images layout totalSeats')
    .populate('boardingPoints', 'name city minutesBeforeDeparture')
    .populate('droppingPoints', 'name city')
    .lean();

  if (!trip) throw AppError.notFound('Trip not found');

  const [withAvailability] = await attachAvailability([trip]);
  return withAvailability;
}

export interface SeatView {
  seatNumber: string;
  row: number;
  column: number;
  status: 'available' | 'held' | 'booked';
  /** True when the current user owns the hold, so their own selection stays selectable. */
  heldByMe?: boolean;
}

export async function getSeatAvailability(tripId: string, userId?: string) {
  const trip = await Trip.findById(tripId).select('totalSeats bookedSeats busType fare').lean();
  if (!trip) throw AppError.notFound('Trip not found');

  const columns = BUS_TYPE_CONFIG[trip.busType as BusType]?.columns ?? 4;
  const layout = generateSeatMap(trip.totalSeats, columns);

  const holds = await SeatHold.find({ trip: trip._id }).select('seatNumber user').lean();
  const holdOwner = new Map(holds.map((h) => [h.seatNumber, h.user.toString()]));
  const booked = new Set(trip.bookedSeats);

  const seats: SeatView[] = layout.map((cell) => {
    if (booked.has(cell.seatNumber)) {
      return { ...cell, status: 'booked' as const };
    }
    const owner = holdOwner.get(cell.seatNumber);
    if (owner) {
      return { ...cell, status: 'held' as const, heldByMe: !!userId && owner === userId };
    }
    return { ...cell, status: 'available' as const };
  });

  return {
    tripId: trip._id.toString(),
    fare: trip.fare,
    totalSeats: trip.totalSeats,
    columns,
    availableCount: seats.filter((s) => s.status === 'available').length,
    seats,
  };
}

export async function listOperators() {
  return Operator.find({ isActive: true }).sort({ rating: -1 }).lean();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
