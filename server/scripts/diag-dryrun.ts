import { buildRoutes, buildSchedules, buildPoints, FLEET_CLASSES } from '../src/seed/network';
import { OPERATORS, TRIP_DAYS } from '../src/seed/data';
import { ALL_STOPS, DIVISIONS } from '../src/constants/bangladesh';

const routes = buildRoutes();
const schedules = buildSchedules(routes);
const points = buildPoints();

console.log('WHAT THE CURRENT SEED CODE WOULD PRODUCE');
console.log('  stops            :', ALL_STOPS.length);
console.log('  operators        :', OPERATORS.length);
console.log('  fleet classes    :', FLEET_CLASSES.length);
console.log('  buses            :', OPERATORS.length * FLEET_CLASSES.length);
console.log('  routes           :', routes.length);
console.log('  schedules/day    :', schedules.length);
console.log('  trip days        :', TRIP_DAYS);
console.log('  TOTAL TRIPS      :', schedules.length * TRIP_DAYS);
console.log('  boarding points  :', points.length);

const covered = new Set(routes.map((r) => `${r.from}->${r.to}`));
const names = ALL_STOPS.map((s) => s.name);
let total = 0, missing = 0; const sample: string[] = [];
for (const a of names) for (const b of names) {
  if (a === b) continue;
  total += 1;
  if (!covered.has(`${a}->${b}`)) { missing += 1; if (sample.length < 12) sample.push(`${a} -> ${b}`); }
}
console.log(`\n  ordered pairs ${total}: covered ${total - missing}, still missing ${missing} (${((missing/total)*100).toFixed(1)}%)`);
console.log('  still-missing examples:', sample);

// Per-division reachability
console.log('\nroutes touching each division:');
for (const d of DIVISIONS) {
  const n = routes.filter((r) => r.fromDivision === d.name || r.toDivision === d.name).length;
  console.log(`  ${d.name.padEnd(12)} ${n}`);
}
