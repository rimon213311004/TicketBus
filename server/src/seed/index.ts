import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { BUS_TYPE_CONFIG } from '../constants';
import {
  User,
  Operator,
  Route,
  Bus,
  Trip,
  BoardingPoint,
  DroppingPoint,
  Booking,
  Payment,
  SeatHold,
} from '../models';
import { listLocalImages, uploadBusImages } from './uploadImages';
import { OPERATORS, TRIP_DAYS, amenitiesForFleet, imageForFleet } from './data';
import { buildGalleries, coachImages, toUrls, unpinnedImages } from './gallery';
import {
  FLEET_CLASSES,
  buildPoints,
  buildRoutes,
  buildSchedules,
  type GeneratedRoute,
  type GeneratedSchedule,
} from './network';
import { seedTours } from './tours';

/** Local midnight today, as the anchor for generated departures. */
function todayAtMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function parseTimeToMinutes(label: string): number {
  const [h, m] = label.split(':').map(Number);
  return h * 60 + m;
}

async function seedOperators(
  imageUrls: Record<string, string>,
  galleries: Map<string, string[]>,
) {
  const operations = OPERATORS.map((op) => ({
    updateOne: {
      filter: { code: op.code },
      update: {
        $set: {
          code: op.code,
          name: op.name,
          slug: op.slug,
          logo: imageUrls[op.image],
          coverImage: imageUrls[op.image],
          gallery: toUrls(galleries.get(op.code) ?? [], imageUrls),
          // Every operator now runs all three modes.
          hasAc: true,
          hasNonAc: true,
          hasSleeper: true,
          rating: op.rating,
          description: `${op.name} runs AC, Non-AC and Sleeper coaches across all 64 districts of Bangladesh.`,
          isActive: true,
        },
      },
      upsert: true,
    },
  }));

  await Operator.bulkWrite(operations, { ordered: false });
  const docs = await Operator.find({}).lean();
  logger.info(`Operators seeded: ${docs.length}`);
  return new Map(docs.map((d) => [d.code, d]));
}

async function seedRoutes(routes: GeneratedRoute[]) {
  const operations = routes.map((r) => ({
    updateOne: {
      filter: { code: r.code },
      update: { $set: { ...r, isActive: true } },
      upsert: true,
    },
  }));

  await Route.bulkWrite(operations, { ordered: false });
  const docs = await Route.find({}).select('_id code from to durationMinutes').lean();
  logger.info(`Routes seeded: ${docs.length}`);
  return new Map(docs.map((d) => [d.code, d]));
}

async function seedPoints() {
  const points = buildPoints();

  const boardingOps = points.map((p) => ({
    updateOne: {
      filter: { city: p.city, name: p.name },
      update: { $set: p },
      upsert: true,
    },
  }));

  // Dropping points reuse the same terminals, minus the boarding-only fields.
  const droppingOps = points.map(({ code, minutesBeforeDeparture, ...rest }) => ({
    updateOne: {
      filter: { city: rest.city, name: rest.name },
      update: { $set: rest },
      upsert: true,
    },
  }));

  await BoardingPoint.bulkWrite(boardingOps, { ordered: false });
  await DroppingPoint.bulkWrite(droppingOps, { ordered: false });

  const [boarding, dropping] = await Promise.all([
    BoardingPoint.find({}).select('_id city').lean(),
    DroppingPoint.find({}).select('_id city').lean(),
  ]);

  const boardingByCity = new Map<string, mongoose.Types.ObjectId[]>();
  for (const point of boarding) {
    if (!boardingByCity.has(point.city)) boardingByCity.set(point.city, []);
    boardingByCity.get(point.city)!.push(point._id);
  }

  const droppingByCity = new Map<string, mongoose.Types.ObjectId[]>();
  for (const point of dropping) {
    if (!droppingByCity.has(point.city)) droppingByCity.set(point.city, []);
    droppingByCity.get(point.city)!.push(point._id);
  }

  logger.info(`Terminals seeded: ${boarding.length} boarding, ${dropping.length} dropping`);
  return { boardingByCity, droppingByCity };
}

/**
 * One bus per operator per fleet class — 15 operators x 4 classes = 60 coaches,
 * shared across the whole timetable rather than one bus per schedule.
 */
async function seedBuses(
  operators: Map<string, { _id: mongoose.Types.ObjectId; name: string }>,
  imageUrls: Record<string, string>,
  galleries: Map<string, string[]>,
) {
  const operations = [];

  for (const op of OPERATORS) {
    const operator = operators.get(op.code);
    if (!operator) continue;

    for (const fleet of FLEET_CLASSES) {
      const registrationNumber = `DHAKA-METRO-B-${op.code.slice(2)}-${fleet.key.toUpperCase()}`;
      const config = BUS_TYPE_CONFIG[fleet.busType];
      const images = toUrls(
        coachImages(imageForFleet(op, fleet.key), op.code, galleries),
        imageUrls,
      );

      operations.push({
        updateOne: {
          filter: { registrationNumber },
          update: {
            $set: {
              operator: operator._id,
              registrationNumber,
              name: `${op.name} ${fleet.label}`,
              busType: fleet.busType,
              acType: fleet.acType,
              totalSeats: config.seats,
              layout: config.layout,
              amenities: amenitiesForFleet(fleet.key),
              images,
              isActive: true,
            },
          },
          upsert: true,
        },
      });
    }
  }

  await Bus.bulkWrite(operations, { ordered: false });
  const docs = await Bus.find({}).select('_id registrationNumber totalSeats').lean();
  logger.info(`Buses seeded: ${docs.length}`);
  return new Map(docs.map((d) => [d.registrationNumber, d]));
}

function busKey(operatorCode: string, fleetKey: string): string {
  return `DHAKA-METRO-B-${operatorCode.slice(2)}-${fleetKey.toUpperCase()}`;
}

async function seedTrips(
  schedules: GeneratedSchedule[],
  operators: Map<string, { _id: mongoose.Types.ObjectId }>,
  routes: Map<string, { _id: mongoose.Types.ObjectId; to: string; from: string; durationMinutes: number }>,
  buses: Map<string, { _id: mongoose.Types.ObjectId; totalSeats: number }>,
  boardingByCity: Map<string, mongoose.Types.ObjectId[]>,
  droppingByCity: Map<string, mongoose.Types.ObjectId[]>,
) {
  const base = todayAtMidnight();
  let upserted = 0;
  let batch: mongoose.AnyBulkWriteOperation[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const result = await Trip.bulkWrite(batch, { ordered: false });
    upserted += result.upsertedCount;
    batch = [];
  };

  for (let day = 0; day < TRIP_DAYS; day += 1) {
    for (const schedule of schedules) {
      const operator = operators.get(schedule.operatorCode);
      const route = routes.get(schedule.routeCode);
      const bus = buses.get(busKey(schedule.operatorCode, schedule.fleetKey));
      if (!operator || !route || !bus) continue;

      const departureTime = addMinutes(
        new Date(base.getTime() + day * 86_400_000),
        parseTimeToMinutes(schedule.departure),
      );

      batch.push({
        updateOne: {
          filter: { code: schedule.code, departureTime },
          update: {
            $set: {
              code: schedule.code,
              operator: operator._id,
              bus: bus._id,
              route: route._id,
              departureTime,
              arrivalTime: addMinutes(departureTime, route.durationMinutes),
              departureLabel: schedule.departure,
              arrivalLabel: schedule.arrival,
              busType: schedule.busType,
              acType: schedule.acType,
              fare: schedule.fare,
              totalSeats: bus.totalSeats,
              boardingPoints: boardingByCity.get(route.from) ?? [],
              droppingPoints: droppingByCity.get(route.to) ?? [],
              isActive: true,
            },
            $setOnInsert: { bookedSeats: [] },
          },
          upsert: true,
        },
      });

      if (batch.length >= 2000) await flush();
    }

    if (day % 5 === 0) logger.info(`  ...trips generated through day ${day + 1}/${TRIP_DAYS}`);
  }

  await flush();
  const total = await Trip.countDocuments({});
  logger.info(`Trips seeded: ${upserted} new, ${total} total`);
}

async function seedUsers() {
  let admin = await User.findOne({ role: 'admin' }).select('+password');
  if (!admin) {
    admin = new User({ email: 'rimon@ticketbus.com' });
  }
  admin.name = 'Rimon';
  admin.email = 'rimon@ticketbus.com';
  admin.phone = '01875895858';
  admin.password = '2002';
  admin.role = 'admin';
  admin.isActive = true;
  admin.isEmailVerified = true;
  await admin.save();
  logger.info(`Admin ready: ${admin.email} / 2002`);

  const demo = await User.findOne({ email: 'demo@ticketbus.com' });
  if (!demo) {
    await User.create({
      name: 'Demo Customer',
      email: 'demo@ticketbus.com',
      phone: '01700000000',
      password: 'Demo@123',
      role: 'customer',
      isEmailVerified: true,
    });
    logger.info('Demo customer created: demo@ticketbus.com / Demo@123');
  }
}

/**
 * The route/schedule codes changed shape when the network was regenerated, so
 * documents from an older seed would otherwise linger and pollute search.
 */
async function pruneStale(routeCodes: Set<string>, scheduleCodes: Set<string>) {
  const [routes, trips, points] = await Promise.all([
    Route.deleteMany({ code: { $nin: [...routeCodes] } }),
    Trip.deleteMany({ code: { $nin: [...scheduleCodes] } }),
    BoardingPoint.deleteMany({ terminalId: { $exists: false } }),
  ]);
  await DroppingPoint.deleteMany({ terminalId: { $exists: false } });

  if (routes.deletedCount || trips.deletedCount || points.deletedCount) {
    logger.warn(
      `Pruned stale docs: ${routes.deletedCount} routes, ${trips.deletedCount} trips, ${points.deletedCount} points`,
    );
  }
}

async function main() {
  const shouldReset = process.argv.includes('--reset') || process.env.SEED_RESET === 'true';

  await connectDatabase();

  if (shouldReset) {
    logger.warn('--reset: clearing trips, bookings, payments, holds and points');
    await Promise.all([
      Trip.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      SeatHold.deleteMany({}),
      BoardingPoint.deleteMany({}),
      DroppingPoint.deleteMany({}),
      Route.deleteMany({}),
    ]);
  }

  const routes = buildRoutes();
  const schedules = buildSchedules(routes);
  logger.info(`Network built: ${routes.length} routes, ${schedules.length} daily schedules`);

  // Every photo in bus_image/ is uploaded; the ones no operator or tour pins by
  // name are spread across the operator galleries automatically.
  const localImages = listLocalImages();
  const extras = unpinnedImages(localImages);
  if (extras.length > 0) {
    logger.info(`New bus photos picked up from bus_image/: ${extras.join(', ')}`);
  }

  const imageUrls = await uploadBusImages(localImages);
  const galleries = buildGalleries(localImages);
  const operatorMap = await seedOperators(imageUrls, galleries);
  const routeMap = await seedRoutes(routes);
  const { boardingByCity, droppingByCity } = await seedPoints();
  const busMap = await seedBuses(operatorMap, imageUrls, galleries);

  await pruneStale(
    new Set(routes.map((r) => r.code)),
    new Set(schedules.map((s) => s.code)),
  );

  await seedTrips(schedules, operatorMap, routeMap, busMap, boardingByCity, droppingByCity);
  await seedTours(operatorMap, imageUrls);
  await seedUsers();

  logger.info('Seed complete.');
  await disconnectDatabase();
}

main().catch(async (err) => {
  logger.error('Seed failed', err);
  await disconnectDatabase();
  process.exit(1);
});
