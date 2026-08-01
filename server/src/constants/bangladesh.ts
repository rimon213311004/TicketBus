/**
 * Bangladesh administrative geography: 8 divisions, all 64 districts, plus the
 * handful of non-district towns travellers actually buy bus tickets to.
 *
 * Coordinates are district-headquarter approximations — good enough to derive
 * road distance (great-circle x a road factor) so we do not have to hand-key a
 * 64x64 distance matrix.
 */

export interface DistrictSeed {
  /** English name, used everywhere as the canonical city string. */
  name: string;
  /** Bangla name, shown in the UI next to the English one. */
  bn: string;
  division: string;
  lat: number;
  lng: number;
  /** True for the divisional headquarter district. */
  hq?: boolean;
}

export interface DivisionSeed {
  name: string;
  bn: string;
  hq: string;
  /** Tailwind-friendly accent used by the destinations explorer. */
  accent: string;
}

/** Lowercase, dash-separated identifier used in URLs and seed JSON. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DIVISIONS: DivisionSeed[] = [
  { name: 'Dhaka', bn: 'ঢাকা বিভাগ', hq: 'Dhaka', accent: '#2563EB' },
  { name: 'Chattogram', bn: 'চট্টগ্রাম বিভাগ', hq: 'Chattogram', accent: '#0EA5E9' },
  { name: 'Khulna', bn: 'খুলনা বিভাগ', hq: 'Khulna', accent: '#22C55E' },
  { name: 'Rajshahi', bn: 'রাজশাহী বিভাগ', hq: 'Rajshahi', accent: '#F59E0B' },
  { name: 'Sylhet', bn: 'সিলেট বিভাগ', hq: 'Sylhet', accent: '#14B8A6' },
  { name: 'Rangpur', bn: 'রংপুর বিভাগ', hq: 'Rangpur', accent: '#8B5CF6' },
  { name: 'Mymensingh', bn: 'ময়মনসিংহ বিভাগ', hq: 'Mymensingh', accent: '#EC4899' },
  { name: 'Barishal', bn: 'বরিশাল বিভাগ', hq: 'Barishal', accent: '#EF4444' },
];

export const DISTRICTS: DistrictSeed[] = [
  // ---- ঢাকা বিভাগ (13) ----
  { name: 'Dhaka', bn: 'ঢাকা', division: 'Dhaka', lat: 23.81, lng: 90.41, hq: true },
  { name: 'Faridpur', bn: 'ফরিদপুর', division: 'Dhaka', lat: 23.6, lng: 89.83 },
  { name: 'Gazipur', bn: 'গাজীপুর', division: 'Dhaka', lat: 23.99, lng: 90.42 },
  { name: 'Gopalganj', bn: 'গোপালগঞ্জ', division: 'Dhaka', lat: 23.01, lng: 89.83 },
  { name: 'Kishoreganj', bn: 'কিশোরগঞ্জ', division: 'Dhaka', lat: 24.44, lng: 90.78 },
  { name: 'Madaripur', bn: 'মাদারীপুর', division: 'Dhaka', lat: 23.16, lng: 90.19 },
  { name: 'Manikganj', bn: 'মানিকগঞ্জ', division: 'Dhaka', lat: 23.86, lng: 90.0 },
  { name: 'Munshiganj', bn: 'মুন্সীগঞ্জ', division: 'Dhaka', lat: 23.54, lng: 90.53 },
  { name: 'Narayanganj', bn: 'নারায়ণগঞ্জ', division: 'Dhaka', lat: 23.62, lng: 90.5 },
  { name: 'Narsingdi', bn: 'নরসিংদী', division: 'Dhaka', lat: 23.92, lng: 90.72 },
  { name: 'Rajbari', bn: 'রাজবাড়ী', division: 'Dhaka', lat: 23.76, lng: 89.65 },
  { name: 'Shariatpur', bn: 'শরীয়তপুর', division: 'Dhaka', lat: 23.2, lng: 90.35 },
  { name: 'Tangail', bn: 'টাঙ্গাইল', division: 'Dhaka', lat: 24.25, lng: 89.92 },

  // ---- চট্টগ্রাম বিভাগ (11) ----
  { name: 'Bandarban', bn: 'বান্দরবান', division: 'Chattogram', lat: 22.2, lng: 92.22 },
  { name: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', lat: 23.96, lng: 91.11 },
  { name: 'Chandpur', bn: 'চাঁদপুর', division: 'Chattogram', lat: 23.23, lng: 90.65 },
  { name: 'Chattogram', bn: 'চট্টগ্রাম', division: 'Chattogram', lat: 22.36, lng: 91.78, hq: true },
  { name: 'Cumilla', bn: 'কুমিল্লা', division: 'Chattogram', lat: 23.46, lng: 91.18 },
  { name: "Cox's Bazar", bn: 'কক্সবাজার', division: 'Chattogram', lat: 21.44, lng: 92.0 },
  { name: 'Feni', bn: 'ফেনী', division: 'Chattogram', lat: 23.02, lng: 91.4 },
  { name: 'Khagrachhari', bn: 'খাগড়াছড়ি', division: 'Chattogram', lat: 23.1, lng: 91.98 },
  { name: 'Lakshmipur', bn: 'লক্ষ্মীপুর', division: 'Chattogram', lat: 22.94, lng: 90.83 },
  { name: 'Noakhali', bn: 'নোয়াখালী', division: 'Chattogram', lat: 22.87, lng: 91.1 },
  { name: 'Rangamati', bn: 'রাঙ্গামাটি', division: 'Chattogram', lat: 22.65, lng: 92.17 },

  // ---- খুলনা বিভাগ (10) ----
  { name: 'Bagerhat', bn: 'বাগেরহাট', division: 'Khulna', lat: 22.66, lng: 89.79 },
  { name: 'Chuadanga', bn: 'চুয়াডাঙ্গা', division: 'Khulna', lat: 23.64, lng: 88.85 },
  { name: 'Jashore', bn: 'যশোর', division: 'Khulna', lat: 23.17, lng: 89.21 },
  { name: 'Jhenaidah', bn: 'ঝিনাইদহ', division: 'Khulna', lat: 23.54, lng: 89.17 },
  { name: 'Khulna', bn: 'খুলনা', division: 'Khulna', lat: 22.81, lng: 89.57, hq: true },
  { name: 'Kushtia', bn: 'কুষ্টিয়া', division: 'Khulna', lat: 23.9, lng: 89.12 },
  { name: 'Magura', bn: 'মাগুরা', division: 'Khulna', lat: 23.49, lng: 89.42 },
  { name: 'Meherpur', bn: 'মেহেরপুর', division: 'Khulna', lat: 23.76, lng: 88.63 },
  { name: 'Narail', bn: 'নড়াইল', division: 'Khulna', lat: 23.16, lng: 89.5 },
  { name: 'Satkhira', bn: 'সাতক্ষীরা', division: 'Khulna', lat: 22.71, lng: 89.07 },

  // ---- রাজশাহী বিভাগ (8) ----
  { name: 'Bogura', bn: 'বগুড়া', division: 'Rajshahi', lat: 24.85, lng: 89.37 },
  { name: 'Chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', lat: 24.6, lng: 88.28 },
  { name: 'Joypurhat', bn: 'জয়পুরহাট', division: 'Rajshahi', lat: 25.1, lng: 89.02 },
  { name: 'Naogaon', bn: 'নওগাঁ', division: 'Rajshahi', lat: 24.8, lng: 88.94 },
  { name: 'Natore', bn: 'নাটোর', division: 'Rajshahi', lat: 24.41, lng: 88.99 },
  { name: 'Pabna', bn: 'পাবনা', division: 'Rajshahi', lat: 24.0, lng: 89.24 },
  { name: 'Rajshahi', bn: 'রাজশাহী', division: 'Rajshahi', lat: 24.37, lng: 88.6, hq: true },
  { name: 'Sirajganj', bn: 'সিরাজগঞ্জ', division: 'Rajshahi', lat: 24.45, lng: 89.7 },

  // ---- সিলেট বিভাগ (4) ----
  { name: 'Habiganj', bn: 'হবিগঞ্জ', division: 'Sylhet', lat: 24.38, lng: 91.42 },
  { name: 'Moulvibazar', bn: 'মৌলভীবাজার', division: 'Sylhet', lat: 24.48, lng: 91.77 },
  { name: 'Sunamganj', bn: 'সুনামগঞ্জ', division: 'Sylhet', lat: 25.07, lng: 91.4 },
  { name: 'Sylhet', bn: 'সিলেট', division: 'Sylhet', lat: 24.9, lng: 91.87, hq: true },

  // ---- রংপুর বিভাগ (8) ----
  { name: 'Dinajpur', bn: 'দিনাজপুর', division: 'Rangpur', lat: 25.63, lng: 88.64 },
  { name: 'Gaibandha', bn: 'গাইবান্ধা', division: 'Rangpur', lat: 25.33, lng: 89.53 },
  { name: 'Kurigram', bn: 'কুড়িগ্রাম', division: 'Rangpur', lat: 25.81, lng: 89.64 },
  { name: 'Lalmonirhat', bn: 'লালমনিরহাট', division: 'Rangpur', lat: 25.92, lng: 89.45 },
  { name: 'Nilphamari', bn: 'নীলফামারী', division: 'Rangpur', lat: 25.93, lng: 88.86 },
  { name: 'Panchagarh', bn: 'পঞ্চগড়', division: 'Rangpur', lat: 26.34, lng: 88.55 },
  { name: 'Rangpur', bn: 'রংপুর', division: 'Rangpur', lat: 25.75, lng: 89.24, hq: true },
  { name: 'Thakurgaon', bn: 'ঠাকুরগাঁও', division: 'Rangpur', lat: 26.03, lng: 88.46 },

  // ---- ময়মনসিংহ বিভাগ (4) ----
  { name: 'Jamalpur', bn: 'জামালপুর', division: 'Mymensingh', lat: 24.94, lng: 89.94 },
  { name: 'Mymensingh', bn: 'ময়মনসিংহ', division: 'Mymensingh', lat: 24.75, lng: 90.4, hq: true },
  { name: 'Netrokona', bn: 'নেত্রকোণা', division: 'Mymensingh', lat: 24.88, lng: 90.73 },
  { name: 'Sherpur', bn: 'শেরপুর', division: 'Mymensingh', lat: 25.02, lng: 90.02 },

  // ---- বরিশাল বিভাগ (6) ----
  { name: 'Barguna', bn: 'বরগুনা', division: 'Barishal', lat: 22.09, lng: 90.11 },
  { name: 'Barishal', bn: 'বরিশাল', division: 'Barishal', lat: 22.7, lng: 90.37, hq: true },
  { name: 'Bhola', bn: 'ভোলা', division: 'Barishal', lat: 22.69, lng: 90.65 },
  { name: 'Jhalokati', bn: 'ঝালকাঠি', division: 'Barishal', lat: 22.64, lng: 90.2 },
  { name: 'Patuakhali', bn: 'পটুয়াখালী', division: 'Barishal', lat: 22.36, lng: 90.33 },
  { name: 'Pirojpur', bn: 'পিরোজপুর', division: 'Barishal', lat: 22.58, lng: 89.98 },
];

/**
 * Tourist towns and border crossings that are not districts but are real
 * ticketed destinations, so they get their own coaches too.
 */
export const EXTRA_STOPS: DistrictSeed[] = [
  { name: 'Teknaf', bn: 'টেকনাফ', division: 'Chattogram', lat: 20.86, lng: 92.3 },
  { name: 'Kuakata', bn: 'কুয়াকাটা', division: 'Barishal', lat: 21.82, lng: 90.12 },
  { name: 'Benapole', bn: 'বেনাপোল', division: 'Khulna', lat: 23.04, lng: 88.93 },
  { name: 'Srimangal', bn: 'শ্রীমঙ্গল', division: 'Sylhet', lat: 24.31, lng: 91.73 },
  { name: 'Sajek', bn: 'সাজেক', division: 'Chattogram', lat: 23.38, lng: 92.29 },
];

/** Every ticketable city: 64 districts plus the extra tourist stops. */
export const ALL_STOPS: DistrictSeed[] = [...DISTRICTS, ...EXTRA_STOPS];

export const STOP_BY_NAME = new Map(ALL_STOPS.map((s) => [s.name, s]));

/**
 * Division -> every ticketable stop inside it, districts and tourist towns
 * alike. Drives the intra-division route mesh and the destinations explorer.
 */
export const STOPS_BY_DIVISION: Record<string, DistrictSeed[]> = Object.fromEntries(
  DIVISIONS.map((division) => [
    division.name,
    ALL_STOPS.filter((stop) => stop.division === division.name),
  ]),
);

/** Terminal names for cities where the real one is well known. */
export const TERMINAL_OVERRIDES: Record<string, string> = {
  Chattogram: 'Bahaddarhat Bus Terminal',
  Khulna: 'Sonadanga Bus Terminal',
  Rajshahi: 'Shiroil Bus Terminal',
  Sylhet: 'Kadamtali Bus Terminal',
  Rangpur: 'Kamarpara Bus Terminal',
  Barishal: 'Nathullabad Bus Terminal',
  Mymensingh: 'Masakanda Bus Terminal',
  "Cox's Bazar": 'Kolatoli Bus Terminal',
  Bogura: 'Charmatha Bus Terminal',
  Jashore: 'Monihar Bus Terminal',
  Cumilla: 'Padua Bazar Bus Terminal',
  Noakhali: 'Maijdee Bus Terminal',
};

/** Extra city-side stops used as dropping points. */
export const DROPPING_OVERRIDES: Record<string, string[]> = {
  Chattogram: ['Dampara', 'AK Khan', 'GEC Circle', 'BRTC'],
  "Cox's Bazar": ['Kolatoli', 'Laboni Beach', 'Bus Terminal'],
  Sylhet: ['Kadamtali', 'Amberkhana', 'Sobhanighat'],
  Rajshahi: ['Rail Gate', 'Shaheb Bazar', 'Bus Terminal'],
  Khulna: ['Sonadanga', 'Royal Mor', 'Notun Rasta'],
  Rangpur: ['Modern Mor', 'Kamarpara', 'Medical Mor'],
  Barishal: ['Nathullabad', 'Rupatoli'],
  Bogura: ['Satmatha', 'Charmatha', 'Banani'],
  Jashore: ['Monihar', 'Chanchra', 'Palbari'],
  Cumilla: ['Kandirpar', 'Padua Bazar', 'Cantonment'],
  Noakhali: ['Maijdee', 'Chowmuhani', 'Sonapur'],
  Mymensingh: ['Masakanda', 'Town Hall', 'Charpara'],
  Bandarban: ['Bus Terminal', 'Meghla'],
  Rangamati: ['Bus Terminal', 'Kaptai Lake Point'],
  Kuakata: ['Beach Point', 'Bus Stand'],
  Teknaf: ['Teknaf Bus Stand', 'Jetty Ghat'],
  Sajek: ['Ruilui Para', 'Khagrachhari Junction'],
  Srimangal: ['Tea Garden Point', 'Bus Stand'],
};

/** Dhaka has many counters, so it keeps a fixed named list. */
export const DHAKA_BOARDING_POINTS = [
  { code: 'BP001', city: 'Dhaka', name: 'Gabtoli', minutesBeforeDeparture: 30 },
  { code: 'BP002', city: 'Dhaka', name: 'Kalyanpur', minutesBeforeDeparture: 20 },
  { code: 'BP003', city: 'Dhaka', name: 'Fakirapool', minutesBeforeDeparture: 20 },
  { code: 'BP004', city: 'Dhaka', name: 'Arambagh', minutesBeforeDeparture: 20 },
  { code: 'BP005', city: 'Dhaka', name: 'Abdullahpur', minutesBeforeDeparture: 25 },
  { code: 'BP006', city: 'Dhaka', name: 'Mohakhali', minutesBeforeDeparture: 25 },
  { code: 'BP007', city: 'Dhaka', name: 'Jatrabari', minutesBeforeDeparture: 20 },
  { code: 'BP008', city: 'Dhaka', name: 'Sayedabad', minutesBeforeDeparture: 20 },
];

const EARTH_RADIUS_KM = 6371;
/** Bangladeshi highways wander, so straight-line distance is scaled up. */
const ROAD_FACTOR = 1.28;

export function roadDistanceKm(a: DistrictSeed, b: DistrictSeed): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  return Math.max(20, Math.round((straight * ROAD_FACTOR) / 5) * 5);
}

/** Average highway speed including one meal break, rounded to a tidy 5 minutes. */
export function travelMinutes(distanceKm: number): number {
  const raw = (distanceKm / 42) * 60 + (distanceKm > 200 ? 40 : 20);
  return Math.round(raw / 5) * 5;
}

export interface DivisionStop {
  name: string;
  bn: string;
  isHq: boolean;
}

export interface DivisionSummary {
  name: string;
  bn: string;
  hq: string;
  accent: string;
  districts: DivisionStop[];
  /** Non-district towns in the division that still sell tickets. */
  touristStops: DivisionStop[];
}

/** Division -> districts, served to the client for the destinations explorer. */
export function divisionSummary(): DivisionSummary[] {
  const toStop = (d: DistrictSeed): DivisionStop => ({
    name: d.name,
    bn: d.bn,
    isHq: Boolean(d.hq),
  });

  return DIVISIONS.map((division) => ({
    name: division.name,
    bn: division.bn,
    hq: division.hq,
    accent: division.accent,
    districts: DISTRICTS.filter((d) => d.division === division.name).map(toStop),
    touristStops: EXTRA_STOPS.filter((d) => d.division === division.name).map(toStop),
  }));
}
