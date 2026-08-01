/**
 * Builds the whole national coach network from the district and terminal
 * datasets: routes, daily schedules, fares and boarding/dropping points.
 * Everything here is deterministic so re-running the seed upserts the same
 * documents instead of duplicating them.
 */
import { BusType, AcType } from '../constants';
import {
  ALL_STOPS,
  DIVISIONS,
  DistrictSeed,
  STOP_BY_NAME,
  STOPS_BY_DIVISION,
  roadDistanceKm,
  slugify,
  travelMinutes,
} from '../constants/bangladesh';
import {
  TERMINALS,
  TERMINALS_BY_DISTRICT,
  TerminalSeed,
  DISTRICTS_WITH_TERMINALS,
} from '../constants/terminals';
import { OPERATORS } from './data';

/** The travel modes every operator runs. */
export interface FleetClass {
  key: string;
  label: string;
  busType: BusType;
  acType: AcType;
  /** Taka per km used to derive the fare. */
  ratePerKm: number;
  minFare: number;
}

export const FLEET_CLASSES: FleetClass[] = [
  { key: 'ac-business', label: 'AC Business Class', busType: 'Business', acType: 'AC', ratePerKm: 3.6, minFare: 550 },
  { key: 'ac-executive', label: 'AC Executive', busType: 'Executive', acType: 'AC', ratePerKm: 4.2, minFare: 650 },
  { key: 'nonac-economy', label: 'Non-AC Economy', busType: 'Economy', acType: 'Non-AC', ratePerKm: 2.2, minFare: 300 },
  { key: 'ac-sleeper', label: 'AC Sleeper', busType: 'Sleeper', acType: 'AC', ratePerKm: 5.0, minFare: 900 },
];

export const FLEET_CLASS_BY_KEY = new Map(FLEET_CLASSES.map((c) => [c.key, c]));

/** A sleeper coach is only scheduled above this distance. */
const SLEEPER_MIN_KM = 220;

export function fareFor(fleetKey: string, distanceKm: number): number {
  const fleet = FLEET_CLASS_BY_KEY.get(fleetKey)!;
  const raw = Math.max(fleet.minFare, distanceKm * fleet.ratePerKm);
  return Math.round(raw / 10) * 10;
}

export interface GeneratedRoute {
  routeId: string;
  code: string;
  from: string;
  to: string;
  fromBn: string;
  toBn: string;
  fromDivision: string;
  toDivision: string;
  fromSlug: string;
  toSlug: string;
  slug: string;
  distanceKm: number;
  durationMinutes: number;
  departures: number;
  isPopular: boolean;
}

/** Corridors travellers ask for beyond the Dhaka spokes. */
const CORRIDORS: Array<[string, string]> = [
  ['Chattogram', "Cox's Bazar"],
  ['Chattogram', 'Bandarban'],
  ['Chattogram', 'Rangamati'],
  ['Chattogram', 'Khagrachhari'],
  ['Chattogram', 'Teknaf'],
  ['Chattogram', 'Cumilla'],
  ['Chattogram', 'Feni'],
  ['Chattogram', 'Noakhali'],
  ['Chattogram', 'Chandpur'],
  ['Chattogram', 'Brahmanbaria'],
  ["Cox's Bazar", 'Teknaf'],
  ['Khagrachhari', 'Sajek'],
  ['Rangamati', 'Sajek'],
  ['Khulna', 'Bagerhat'],
  ['Khulna', 'Satkhira'],
  ['Khulna', 'Jashore'],
  ['Khulna', 'Kushtia'],
  ['Khulna', 'Jhenaidah'],
  ['Jashore', 'Benapole'],
  ['Jashore', 'Narail'],
  ['Kushtia', 'Chuadanga'],
  ['Kushtia', 'Meherpur'],
  ['Sylhet', 'Srimangal'],
  ['Sylhet', 'Moulvibazar'],
  ['Sylhet', 'Sunamganj'],
  ['Sylhet', 'Habiganj'],
  ['Barishal', 'Kuakata'],
  ['Barishal', 'Patuakhali'],
  ['Barishal', 'Bhola'],
  ['Barishal', 'Pirojpur'],
  ['Barishal', 'Jhalokati'],
  ['Barishal', 'Barguna'],
  ['Rajshahi', 'Bogura'],
  ['Rajshahi', 'Chapainawabganj'],
  ['Rajshahi', 'Natore'],
  ['Rajshahi', 'Pabna'],
  ['Rajshahi', 'Naogaon'],
  ['Bogura', 'Joypurhat'],
  ['Bogura', 'Sirajganj'],
  ['Rangpur', 'Dinajpur'],
  ['Rangpur', 'Panchagarh'],
  ['Rangpur', 'Kurigram'],
  ['Rangpur', 'Thakurgaon'],
  ['Rangpur', 'Nilphamari'],
  ['Rangpur', 'Lalmonirhat'],
  ['Rangpur', 'Gaibandha'],
  ['Mymensingh', 'Netrokona'],
  ['Mymensingh', 'Jamalpur'],
  ['Mymensingh', 'Sherpur'],
  ['Mymensingh', 'Kishoreganj'],
  ['Mymensingh', 'Tangail'],
];

/** Dhaka spokes that carry the heaviest traffic get the fullest timetable. */
const HIGH_DEMAND_FROM_DHAKA = new Set([
  'Chattogram', "Cox's Bazar", 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal',
  'Rangpur', 'Mymensingh', 'Bogura', 'Cumilla', 'Jashore', 'Benapole',
  'Teknaf', 'Kuakata', 'Dinajpur', 'Bandarban', 'Srimangal', 'Rangamati',
]);

const HQ_NAMES = DIVISIONS.map((d) => d.hq);

function pad(n: number, width = 3): string {
  return String(n).padStart(width, '0');
}

/** Three-letter city code used inside route ids, e.g. Dhaka -> DHK. */
function cityCode(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase();
  const consonants = letters.slice(1).replace(/[AEIOU]/g, '');
  return (letters[0] + consonants).slice(0, 3).padEnd(3, 'X');
}

function makeRoute(
  index: number,
  a: DistrictSeed,
  b: DistrictSeed,
  departures: number,
  isPopular: boolean,
): GeneratedRoute {
  const distanceKm = roadDistanceKm(a, b);
  const fromSlug = slugify(a.name);
  const toSlug = slugify(b.name);
  return {
    routeId: `RT-${cityCode(a.name)}-${cityCode(b.name)}`,
    code: `RT${pad(index, 4)}`,
    from: a.name,
    to: b.name,
    fromBn: a.bn,
    toBn: b.bn,
    fromDivision: a.division,
    toDivision: b.division,
    fromSlug,
    toSlug,
    slug: `${fromSlug}-to-${toSlug}`,
    distanceKm,
    durationMinutes: travelMinutes(distanceKm),
    departures,
    isPopular,
  };
}

/** Departures for a pair inside one division: HQ-bound corridors run more often. */
const INTRA_DIVISION_HQ_DEPARTURES = 3;
const INTRA_DIVISION_DEPARTURES = 2;

/**
 * Long-tail cross-division pairs — Faridpur to Bandarban and the like. Real
 * operators would make you change at a hub, but a traveller searching the pair
 * should still be offered something, so each gets a modest two-coach day: one
 * morning AC service and one overnight.
 */
const LONG_TAIL_DEPARTURES = 2;

/**
 * Dhaka spokes to all 63 other stops, the divisional-HQ mesh, the regional
 * corridors, and a full mesh inside every division — each generated in both
 * directions.
 */
export function buildRoutes(): GeneratedRoute[] {
  const routes: GeneratedRoute[] = [];
  const seen = new Set<string>();
  let index = 1;

  const push = (aName: string, bName: string, departures: number, popular: boolean) => {
    const a = STOP_BY_NAME.get(aName);
    const b = STOP_BY_NAME.get(bName);
    if (!a || !b || a.name === b.name) return;
    const key = `${a.name}->${b.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    routes.push(makeRoute(index, a, b, departures, popular));
    index += 1;
  };

  // 1. Dhaka to every other district and tourist stop, both ways.
  for (const stop of ALL_STOPS) {
    if (stop.name === 'Dhaka') continue;
    const popular = HIGH_DEMAND_FROM_DHAKA.has(stop.name);
    const departures = popular ? 6 : 3;
    push('Dhaka', stop.name, departures, popular);
    push(stop.name, 'Dhaka', departures, popular);
  }

  // 2. Divisional headquarter mesh.
  for (let i = 0; i < HQ_NAMES.length; i += 1) {
    for (let j = i + 1; j < HQ_NAMES.length; j += 1) {
      push(HQ_NAMES[i], HQ_NAMES[j], 2, false);
      push(HQ_NAMES[j], HQ_NAMES[i], 2, false);
    }
  }

  // 3. Regional and tourist corridors.
  for (const [a, b] of CORRIDORS) {
    push(a, b, 3, false);
    push(b, a, 3, false);
  }

  // 4. Full mesh inside each division, so every district reaches every other
  //    district of its own division — and its divisional HQ — directly.
  for (const division of DIVISIONS) {
    const stops = STOPS_BY_DIVISION[division.name] ?? [];
    for (let i = 0; i < stops.length; i += 1) {
      for (let j = i + 1; j < stops.length; j += 1) {
        const touchesHq = stops[i].name === division.hq || stops[j].name === division.hq;
        const departures = touchesHq ? INTRA_DIVISION_HQ_DEPARTURES : INTRA_DIVISION_DEPARTURES;
        push(stops[i].name, stops[j].name, departures, false);
        push(stops[j].name, stops[i].name, departures, false);
      }
    }
  }

  // 5. Completion pass: anything still unpaired after the steps above — mostly
  //    district-to-district across two different divisions — gets the long-tail
  //    timetable, so no search comes back empty.
  for (const a of ALL_STOPS) {
    for (const b of ALL_STOPS) {
      if (a.name === b.name) continue;
      push(a.name, b.name, LONG_TAIL_DEPARTURES, false);
    }
  }

  return routes;
}

export interface GeneratedSchedule {
  code: string;
  operatorCode: string;
  routeCode: string;
  fleetKey: string;
  departure: string;
  arrival: string;
  busType: BusType;
  acType: AcType;
  fare: number;
}

/** Departure clock times, chosen so long routes get a proper night coach. */
const DEPARTURE_PATTERNS: Record<number, string[]> = {
  2: ['08:00', '21:30'],
  3: ['07:00', '14:30', '22:00'],
  6: ['06:00', '08:30', '11:30', '16:00', '21:00', '23:30'],
};

/** Rotate classes so every corridor shows AC, Non-AC and Sleeper options. */
function classForSlot(slot: number, departures: number, distanceKm: number): FleetClass {
  const sleeperOk = distanceKm >= SLEEPER_MIN_KM;
  if (sleeperOk && slot === departures - 1) return FLEET_CLASS_BY_KEY.get('ac-sleeper')!;
  if (slot === 1) return FLEET_CLASS_BY_KEY.get('nonac-economy')!;
  if (slot === 3) return FLEET_CLASS_BY_KEY.get('ac-executive')!;
  if (slot === 4) return FLEET_CLASS_BY_KEY.get('nonac-economy')!;
  return FLEET_CLASS_BY_KEY.get('ac-business')!;
}

function addClock(label: string, minutes: number): string {
  const [h, m] = label.split(':').map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function buildSchedules(routes: GeneratedRoute[]): GeneratedSchedule[] {
  const schedules: GeneratedSchedule[] = [];

  routes.forEach((route, routeIndex) => {
    const times = DEPARTURE_PATTERNS[route.departures] ?? DEPARTURE_PATTERNS[3];

    times.forEach((departure, slot) => {
      const fleet = classForSlot(slot, times.length, route.distanceKm);
      // Deterministic operator rotation keeps re-seeds stable.
      const operator = OPERATORS[(routeIndex * 7 + slot * 3) % OPERATORS.length];

      schedules.push({
        code: `${route.code}-${slot + 1}`,
        operatorCode: operator.code,
        routeCode: route.code,
        fleetKey: fleet.key,
        departure,
        arrival: addClock(departure, route.durationMinutes),
        busType: fleet.busType,
        acType: fleet.acType,
        fare: fareFor(fleet.key, route.distanceKm),
      });
    });
  });

  return schedules;
}

export interface PointSeed {
  code: string;
  terminalId: string;
  city: string;
  division: string;
  upazila: string;
  name: string;
  address: string;
  slug: string;
  districtSlug: string;
  divisionSlug: string;
  lat: number;
  lng: number;
  phone: string;
  kind: 'terminal' | 'counter';
  minutesBeforeDeparture: number;
  isActive: boolean;
}

/** Districts without hand-written terminals still need one to board at. */
function fallbackTerminal(stop: DistrictSeed): TerminalSeed {
  return {
    id: `TRM-${stop.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-001`,
    district: stop.name,
    upazila: `${stop.name} Sadar`,
    name: `${stop.name} Bus Terminal`,
    address: `Bus Terminal Road, ${stop.name} Sadar`,
    lat: stop.lat,
    lng: stop.lng,
    phone: '01711-000100',
    kind: 'terminal',
    reportingMinutes: 25,
    isActive: true,
  };
}

/** Every terminal, resolved per city — real data where we have it. */
export function terminalsForCity(city: string): TerminalSeed[] {
  if (DISTRICTS_WITH_TERMINALS.has(city)) return TERMINALS_BY_DISTRICT[city];
  const stop = STOP_BY_NAME.get(city);
  return stop ? [fallbackTerminal(stop)] : [];
}

function toPointSeed(terminal: TerminalSeed, index: number): PointSeed {
  const stop = STOP_BY_NAME.get(terminal.district);
  const division = stop?.division ?? 'Dhaka';
  return {
    code: `BP${pad(index, 4)}`,
    terminalId: terminal.id,
    city: terminal.district,
    division,
    upazila: terminal.upazila,
    name: terminal.name,
    address: terminal.address,
    slug: slugify(terminal.name),
    districtSlug: slugify(terminal.district),
    divisionSlug: slugify(division),
    lat: terminal.lat,
    lng: terminal.lng,
    phone: terminal.phone,
    kind: terminal.kind,
    minutesBeforeDeparture: terminal.reportingMinutes,
    isActive: terminal.isActive,
  };
}

/** Boarding and dropping points share the same physical terminal list. */
export function buildPoints(): PointSeed[] {
  const points: PointSeed[] = [];
  let index = 1;

  for (const stop of ALL_STOPS) {
    for (const terminal of terminalsForCity(stop.name)) {
      points.push(toPointSeed(terminal, index));
      index += 1;
    }
  }

  return points;
}

/** Raw terminal count, used by the seed summary. */
export const TERMINAL_COUNT = TERMINALS.length;
