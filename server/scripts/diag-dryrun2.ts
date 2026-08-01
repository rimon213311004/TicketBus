import { buildRoutes, buildSchedules } from '../src/seed/network';
import { TRIP_DAYS } from '../src/seed/data';
import { ALL_STOPS } from '../src/constants/bangladesh';

const routes = buildRoutes();
const schedules = buildSchedules(routes);
console.log('routes:', routes.length, '| schedules/day:', schedules.length, '| trips:', schedules.length * TRIP_DAYS);

const covered = new Set(routes.map((r) => `${r.from}->${r.to}`));
const names = ALL_STOPS.map((s) => s.name);
let total = 0, missing = 0;
for (const a of names) for (const b of names) { if (a === b) continue; total += 1; if (!covered.has(`${a}->${b}`)) missing += 1; }
console.log(`pairs ${total}: covered ${total - missing}, missing ${missing}`);

const dur = routes.map((r) => r.durationMinutes);
console.log('duration min/max hours:', (Math.min(...dur)/60).toFixed(1), '/', (Math.max(...dur)/60).toFixed(1));
const dist = routes.map((r) => r.distanceKm);
console.log('distance min/max km:', Math.min(...dist), '/', Math.max(...dist));
const over24 = routes.filter((r) => r.durationMinutes >= 24 * 60);
console.log('routes >= 24h:', over24.length, over24.slice(0,3).map(r=>`${r.from}->${r.to} ${(r.durationMinutes/60).toFixed(1)}h`));

// duplicate code check
const codes = new Set(routes.map(r=>r.code));
console.log('unique route codes:', codes.size, '=== routes?', codes.size === routes.length);
const scodes = new Set(schedules.map(s=>s.code));
console.log('unique schedule codes:', scodes.size, '=== schedules?', scodes.size === schedules.length);

// fare sanity
const fares = schedules.map(s=>s.fare);
console.log('fare min/max:', Math.min(...fares), '/', Math.max(...fares));
// sample a previously-missing pair
const sample = routes.find(r=>r.from==='Faridpur' && r.to==='Bandarban');
console.log('sample Faridpur->Bandarban:', sample && { km: sample.distanceKm, mins: sample.durationMinutes, dep: sample.departures });
console.log('its schedules:', schedules.filter(s=>s.routeCode===sample?.code).map(s=>`${s.departure}->${s.arrival} ${s.busType} ${s.acType} ৳${s.fare}`));
