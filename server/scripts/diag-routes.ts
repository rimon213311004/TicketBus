import mongoose from 'mongoose';
import { env } from '../src/config/env';
(async () => {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db!;
  const rs = await db.collection('routes').find({}, { projection: { from: 1, to: 1, code: 1 } }).toArray();
  console.log('existing routes in DB:');
  rs.forEach((r: any) => console.log(`  ${r.code ?? '?'}  ${r.from} -> ${r.to}`));
  const ops = await db.collection('operators').find({}, { projection: { name: 1 } }).toArray();
  console.log('operators:', ops.map((o: any) => o.name).join(', '));
  await mongoose.disconnect();
})();
