import mongoose from 'mongoose';
import fs from 'fs';
import { env } from '../src/config/env';
(async () => {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db!;
  const bookings = await db.collection('bookings').find({}).toArray();
  const out: any[] = [];
  for (const b of bookings as any[]) {
    const trip = b.trip ? await db.collection('trips').findOne({ _id: b.trip }) : null;
    const route = b.route ? await db.collection('routes').findOne({ _id: b.route }) : null;
    out.push({
      _id: b._id, bookingCode: b.bookingCode, status: b.status,
      seatNumbers: b.seatNumbers, journeyDate: b.journeyDate,
      tripId: b.trip, tripCode: trip?.code, tripDeparture: trip?.departureTime,
      routeId: b.route, from: route?.from, to: route?.to,
      operator: b.operator, boardingPoint: b.boardingPoint, droppingPoint: b.droppingPoint,
    });
  }
  fs.writeFileSync('server/scripts/out/bookings-snapshot.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await mongoose.disconnect();
})();
