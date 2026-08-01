/**
 * Re-points bookings left dangling by a network re-seed.
 *
 * The seed prunes routes and trips whose codes changed shape, which orphans any
 * booking made against the old timetable. For each such booking this finds the
 * closest equivalent trip on the new network — same city pair, same journey
 * date, nearest departure time — and rewrites the booking's references, then
 * marks its seats sold on the new trip so the seat map stays truthful.
 *
 * Idempotent: bookings whose trip still resolves are left alone.
 *
 * Usage: tsx server/scripts/repair-bookings.ts [--apply]
 */
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../src/config/env';

const APPLY = process.argv.includes('--apply');

/**
 * Pre-seed snapshot of each booking's city pair, written by
 * snapshot-booking.ts. Once the old route docs are pruned this is the only
 * record of where a booking was actually going.
 */
const SNAPSHOT = path.join(__dirname, 'out', 'bookings-snapshot.json');

function loadSnapshot(): Map<string, { from?: string; to?: string }> {
  if (!fs.existsSync(SNAPSHOT)) return new Map();
  const rows = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) as Array<{
    bookingCode: string;
    from?: string;
    to?: string;
  }>;
  return new Map(rows.map((r) => [r.bookingCode, { from: r.from, to: r.to }]));
}

function minutesOfDay(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

(async () => {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db!;
  const bookings = db.collection('bookings');
  const trips = db.collection('trips');
  const routes = db.collection('routes');
  const points = db.collection('boardingpoints');
  const dropPoints = db.collection('droppingpoints');

  const snapshot = loadSnapshot();
  const all = await bookings.find({}).toArray();
  console.log(`${all.length} bookings found, ${snapshot.size} in the pre-seed snapshot\n`);

  let repaired = 0;
  let healthy = 0;
  let failed = 0;

  for (const b of all as any[]) {
    const existingTrip = b.trip ? await trips.findOne({ _id: b.trip }) : null;
    if (existingTrip) {
      healthy += 1;
      console.log(`  OK      ${b.bookingCode} — trip still valid`);
      continue;
    }

    // The booking's own route doc may also be gone; fall back to the snapshot
    // of city names stored on the booking itself where present.
    const oldRoute = b.route ? await routes.findOne({ _id: b.route }) : null;
    const snap = snapshot.get(b.bookingCode);
    const from = oldRoute?.from ?? snap?.from ?? b.fromCity;
    const to = oldRoute?.to ?? snap?.to ?? b.toCity;

    if (!from || !to) {
      failed += 1;
      console.log(`  FAIL    ${b.bookingCode} — cannot tell which route it was on`);
      continue;
    }

    const newRoute = await routes.findOne({ from, to, isActive: true });
    if (!newRoute) {
      failed += 1;
      console.log(`  FAIL    ${b.bookingCode} — no route ${from} -> ${to} on the new network`);
      continue;
    }

    // Same calendar day as the original journey.
    const journey = new Date(b.journeyDate);
    const dayStart = new Date(Date.UTC(journey.getUTCFullYear(), journey.getUTCMonth(), journey.getUTCDate(), 0, 0, 0));
    const dayEnd = new Date(dayStart.getTime() + 86_399_000);

    let candidates = await trips
      .find({ route: newRoute._id, departureTime: { $gte: dayStart, $lte: dayEnd }, isActive: true })
      .toArray();

    // A booking whose journey date has already passed has no same-day trip on
    // the regenerated timetable; roll it forward to the first future departure
    // rather than leaving it dangling.
    let movedTo: string | null = null;
    if (candidates.length === 0) {
      const next = await trips
        .find({ route: newRoute._id, departureTime: { $gte: new Date() }, isActive: true })
        .sort({ departureTime: 1 })
        .limit(1)
        .toArray();

      if (next.length > 0) {
        const day = new Date(next[0].departureTime);
        const nextStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
        candidates = await trips
          .find({
            route: newRoute._id,
            departureTime: { $gte: nextStart, $lte: new Date(nextStart.getTime() + 86_399_000) },
            isActive: true,
          })
          .toArray();
        movedTo = nextStart.toISOString().slice(0, 10);
      }
    }

    if (candidates.length === 0) {
      failed += 1;
      console.log(`  FAIL    ${b.bookingCode} — no ${from} -> ${to} trip on ${dayStart.toISOString().slice(0, 10)}`);
      continue;
    }

    // Prefer a departure closest to the original, and one that can still seat them.
    const wanted = minutesOfDay(new Date(b.journeyDate));
    const seats: string[] = b.seatNumbers ?? [];
    const usable = candidates.filter(
      (t: any) => !seats.some((s) => (t.bookedSeats ?? []).includes(s)),
    );
    const pool = usable.length > 0 ? usable : candidates;
    pool.sort(
      (x: any, y: any) =>
        Math.abs(minutesOfDay(new Date(x.departureTime)) - wanted) -
        Math.abs(minutesOfDay(new Date(y.departureTime)) - wanted),
    );
    const trip = pool[0] as any;

    const boarding = await points.findOne({ city: from, isActive: true });
    const dropping = await dropPoints.findOne({ city: to, isActive: true });

    console.log(
      `  REPAIR  ${b.bookingCode} — ${from} -> ${to} seats ${seats.join(',') || '-'} ` +
        `=> trip ${trip.code} @ ${trip.departureLabel} (${trip.busType} ${trip.acType}, ৳${trip.fare})` +
        (movedTo ? `  [journey date rolled forward to ${movedTo} — original had passed]` : ''),
    );

    if (APPLY) {
      await bookings.updateOne(
        { _id: b._id },
        {
          $set: {
            trip: trip._id,
            route: newRoute._id,
            operator: trip.operator,
            bus: trip.bus,
            ...(boarding ? { boardingPoint: boarding._id } : {}),
            ...(dropping ? { droppingPoint: dropping._id } : {}),
            ...(movedTo ? { journeyDate: new Date(`${movedTo}T00:00:00.000Z`) } : {}),
          },
        },
      );

      // Keep the seat map honest for bookings that still hold seats.
      const stillHoldsSeats = !['CANCELLED', 'EXPIRED'].includes(b.status);
      if (stillHoldsSeats && seats.length > 0) {
        await trips.updateOne({ _id: trip._id }, { $addToSet: { bookedSeats: { $each: seats } } });
      }
    }
    repaired += 1;
  }

  console.log(
    `\n${APPLY ? 'APPLIED' : 'DRY RUN'} — healthy ${healthy}, repaired ${repaired}, failed ${failed}`,
  );
  if (!APPLY) console.log('Re-run with --apply to write these changes.');

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
