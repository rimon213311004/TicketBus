import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { ALL_STOPS } from '../src/constants/bangladesh';

(async () => {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db!;
  console.log('counts:', {
    stops: ALL_STOPS.length,
    routes: await db.collection('routes').countDocuments(),
    trips: await db.collection('trips').countDocuments(),
    buses: await db.collection('buses').countDocuments(),
    operators: await db.collection('operators').countDocuments(),
  });

  const byDay = await db.collection('trips').aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$departureTime', timezone: 'Asia/Dhaka' } }, n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  console.log('days covered:', byDay.length, '| first:', byDay[0]?._id, '| last:', byDay[byDay.length - 1]?._id);

  // How many of the 64x63 ordered stop pairs actually have a route?
  const routeDocs = await db.collection('routes').find({}, { projection: { from: 1, to: 1 } }).toArray();
  const have = new Set(routeDocs.map((r: any) => `${r.from}->${r.to}`));
  const names = ALL_STOPS.map((s) => s.name);
  let total = 0, missing = 0;
  const sample: string[] = [];
  for (const a of names) for (const b of names) {
    if (a === b) continue;
    total += 1;
    if (!have.has(`${a}->${b}`)) { missing += 1; if (sample.length < 15) sample.push(`${a} -> ${b}`); }
  }
  console.log(`ordered pairs: ${total}, with route: ${total - missing}, MISSING: ${missing} (${((missing/total)*100).toFixed(1)}%)`);
  console.log('missing examples:', sample);
  await mongoose.disconnect();
})();
