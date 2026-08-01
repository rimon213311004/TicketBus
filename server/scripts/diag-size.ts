import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { ALL_STOPS, DIVISIONS } from '../src/constants/bangladesh';
(async () => {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db!;
  const s: any = await db.command({ dbStats: 1, scale: 1024 * 1024 });
  console.log('DB size (MB):', { data: +s.dataSize.toFixed(1), storage: +s.storageSize.toFixed(1), index: +s.indexSize.toFixed(1), objects: s.objects });
  const t: any = await db.command({ collStats: 'trips', scale: 1024 });
  console.log('avg trip doc bytes:', t.avgObjSize, '| trips:', t.count);

  // cross-division ordered pair count
  const byName = new Map(ALL_STOPS.map((x) => [x.name, x]));
  let cross = 0, intra = 0;
  for (const a of ALL_STOPS) for (const b of ALL_STOPS) {
    if (a.name === b.name) continue;
    if (a.division === b.division) intra += 1; else cross += 1;
  }
  console.log('ordered pairs -> intra-division:', intra, '| cross-division:', cross, '| total:', intra + cross);
  console.log('divisions:', DIVISIONS.length, '| stops:', ALL_STOPS.length, '| byName ok:', byName.size);
  await mongoose.disconnect();
})();
