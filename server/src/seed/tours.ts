import mongoose from 'mongoose';
import { TourPackage } from '../models';
import { logger } from '../utils/logger';
import { STOP_BY_NAME, slugify } from '../constants/bangladesh';
import type { TourCategory } from '../models/TourPackage';
import type { BusType, AcType } from '../constants';

interface TourSeed {
  code: string;
  title: string;
  destination: string;
  category: TourCategory;
  summary: string;
  description: string;
  highlights: string[];
  itinerary: Array<{ day: number; title: string; detail: string }>;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  oldPrice?: number;
  departureDays: string[];
  bestSeason: string;
  groupSize: string;
  operatorCode: string;
  coachLabel: string;
  busType: BusType;
  acType: AcType;
  seats: number;
  image: string;
  rating: number;
  totalReviews: number;
  isFeatured?: boolean;
}

const STANDARD_INCLUSIONS = [
  'Return AC coach from Dhaka',
  'Hotel accommodation on twin sharing',
  'Daily breakfast and dinner',
  'All sightseeing by reserved transport',
  'Experienced Bangla-speaking tour guide',
  'All entry tickets and permits',
];

const STANDARD_EXCLUSIONS = [
  'Lunch and personal expenses',
  'Camera or drone fees at spots',
  'Travel insurance',
  'Anything not listed under inclusions',
];

export const TOURS: TourSeed[] = [
  {
    code: 'TP001',
    title: "Cox's Bazar Beach Escape",
    destination: "Cox's Bazar",
    category: 'Beach',
    summary: "Three days on the world's longest natural sea beach, with Himchari and Inani.",
    description:
      "The classic Bangladeshi beach holiday. Overnight AC sleeper from Dhaka, two full days along the 120 km shoreline, sunrise at Laboni, the waterfall at Himchari and the coral-strewn stretch at Inani, plus an evening at Burmese Market.",
    highlights: ['Laboni & Sugandha beach', 'Himchari waterfall', 'Inani coral beach', 'Burmese Market shopping', 'Sunset at Darianagar'],
    itinerary: [
      { day: 1, title: 'Dhaka to Cox\'s Bazar', detail: 'Evening AC sleeper from Kalyanpur, arrive at dawn, hotel check-in and rest.' },
      { day: 2, title: 'Beach and Himchari', detail: 'Sunrise at Laboni, Himchari waterfall and national park, sunset at Inani coral beach.' },
      { day: 3, title: 'Market and return', detail: 'Burmese Market shopping, seafood lunch, night coach back to Dhaka.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 8500, oldPrice: 10500,
    departureDays: ['Thursday', 'Friday'], bestSeason: 'November – March', groupSize: '12 – 32 travellers',
    operatorCode: 'OP001', coachLabel: 'Green Line AC Sleeper', busType: 'Sleeper', acType: 'AC', seats: 24,
    image: 'green.jpg', rating: 4.8, totalReviews: 214, isFeatured: true,
  },
  {
    code: 'TP002',
    title: 'Sajek Valley Cloud Tour',
    destination: 'Sajek',
    category: 'Hill Track',
    summary: 'Wake above the clouds in the Kanglak hills, with a Chander Gari ride through Khagrachhari.',
    description:
      'Sajek sits at 1,800 feet and is famous for the sea of cloud that fills the valley at sunrise. The package covers the reserved Chander Gari convoy from Khagrachhari, two nights in a resort at Ruilui Para, the Kanglak peak trek and Alutila cave on the way back.',
    highlights: ['Cloud sunrise at Konglak', 'Chander Gari hill convoy', 'Ruilui Para tribal village', 'Alutila cave', 'Risang waterfall'],
    itinerary: [
      { day: 1, title: 'Dhaka to Khagrachhari', detail: 'Night coach from Dhaka, breakfast at Khagrachhari, Chander Gari convoy up to Sajek.' },
      { day: 2, title: 'Sajek sunrise', detail: 'Sunrise over the cloud sea, Konglak peak trek, Ruilui Para and the Lusai village.' },
      { day: 3, title: 'Alutila and return', detail: 'Descend to Khagrachhari, Alutila cave and Risang waterfall, night coach home.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 9800,
    departureDays: ['Wednesday', 'Friday'], bestSeason: 'July – February', groupSize: '10 – 24 travellers',
    operatorCode: 'OP007', coachLabel: 'Saintmartin AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'Akota.jpg', rating: 4.9, totalReviews: 168, isFeatured: true,
  },
  {
    code: 'TP003',
    title: 'Sundarbans Mangrove Cruise',
    destination: 'Khulna',
    category: 'Forest',
    summary: 'Three nights aboard a launch through the largest mangrove forest on earth.',
    description:
      'Departing from Khulna, this cruise threads the Sundarbans waterways to Karamjal, Kotka and Jamtola beach, with canoe rides into the narrow creeks. Deer, crocodiles and if you are lucky, pugmarks of the Royal Bengal tiger.',
    highlights: ['Karamjal wildlife centre', 'Kotka watchtower', 'Jamtola sea beach', 'Small-canoe creek safari', 'Sunset at Dublar Char'],
    itinerary: [
      { day: 1, title: 'Dhaka to Khulna', detail: 'Night AC coach to Khulna, board the launch at Rupsha ghat.' },
      { day: 2, title: 'Into the forest', detail: 'Sail to Karamjal, canoe safari through the creeks, night anchored in the forest.' },
      { day: 3, title: 'Kotka and Jamtola', detail: 'Kotka watchtower at dawn, trek to Jamtola beach, Dublar Char at sunset.' },
      { day: 4, title: 'Return', detail: 'Sail back to Khulna, evening coach to Dhaka.' },
    ],
    durationDays: 4, durationNights: 3, pricePerPerson: 14500, oldPrice: 16500,
    departureDays: ['Friday'], bestSeason: 'October – March', groupSize: '16 – 40 travellers',
    operatorCode: 'OP008', coachLabel: 'Desh Travels AC Executive', busType: 'Executive', acType: 'AC', seats: 32,
    image: 'Desh.jpg', rating: 4.7, totalReviews: 96, isFeatured: true,
  },
  {
    code: 'TP004',
    title: 'Srimangal Tea Garden Retreat',
    destination: 'Srimangal',
    category: 'Tea Garden',
    summary: 'Two days among the tea estates, Lawachara rainforest and the seven-layer tea.',
    description:
      'The tea capital of Bangladesh. Walk the Finlay estates at dawn, spot hoolock gibbons in Lawachara National Park, ride to the Madhabpur lake and finish with the famous seven-layer tea at Nilkantha.',
    highlights: ['Lawachara National Park', 'Finlay tea estate walk', 'Madhabpur Lake', 'Seven-layer tea', 'Manipuri weaving village'],
    itinerary: [
      { day: 1, title: 'Dhaka to Srimangal', detail: 'Morning AC coach, afternoon tea estate walk, evening at Nilkantha tea cabin.' },
      { day: 2, title: 'Rainforest and lake', detail: 'Lawachara trek, Madhabpur Lake, Manipuri para, night coach back.' },
    ],
    durationDays: 2, durationNights: 1, pricePerPerson: 5200,
    departureDays: ['Thursday', 'Saturday'], bestSeason: 'October – April', groupSize: '10 – 30 travellers',
    operatorCode: 'OP005', coachLabel: 'Ena AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'ena.jpg', rating: 4.6, totalReviews: 142,
  },
  {
    code: 'TP005',
    title: 'Kuakata Sunrise & Sunset',
    destination: 'Kuakata',
    category: 'Beach',
    summary: 'The only beach in the country where you see both sunrise and sunset over the water.',
    description:
      'Kuakata faces south into the Bay of Bengal, so the sun rises and sets over the same stretch of sand. The trip adds the Rakhine village, Fatrar Char mangrove and the century-old Buddhist temple.',
    highlights: ['Sunrise and sunset from one beach', 'Fatrar Char mangrove', 'Rakhine tribal village', 'Gangamati reserved forest', 'Misripara Buddhist temple'],
    itinerary: [
      { day: 1, title: 'Dhaka to Kuakata', detail: 'Night coach via Padma Bridge, arrive at dawn for the sunrise.' },
      { day: 2, title: 'Beach and char', detail: 'Fatrar Char by boat, Rakhine para, Misripara temple, sunset at Zero Point.' },
      { day: 3, title: 'Return', detail: 'Last sunrise, Gangamati forest walk, afternoon coach home.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 7200,
    departureDays: ['Thursday', 'Friday'], bestSeason: 'November – March', groupSize: '12 – 32 travellers',
    operatorCode: 'OP014', coachLabel: 'Shanti AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'shanti poribohon.jpg', rating: 4.5, totalReviews: 88,
  },
  {
    code: 'TP006',
    title: 'Bandarban Hill Adventure',
    destination: 'Bandarban',
    category: 'Hill Track',
    summary: 'Nilgiri, Nilachal and the Boga Lake trek in the highest hills of Bangladesh.',
    description:
      'Bandarban holds the country\'s tallest peaks. This package covers Nilgiri at cloud level, the Chimbuk range drive, Shoilo Propat waterfall, the Golden Temple and an optional trek towards Boga Lake.',
    highlights: ['Nilgiri hill resort viewpoint', 'Chimbuk range drive', 'Shoilo Propat waterfall', 'Buddha Dhatu Golden Temple', 'Sangu river boat ride'],
    itinerary: [
      { day: 1, title: 'Dhaka to Bandarban', detail: 'Night coach, morning arrival, Meghla and the Golden Temple.' },
      { day: 2, title: 'Nilgiri and Chimbuk', detail: 'Full-day jeep to Nilgiri via Chimbuk, Shoilo Propat on the way back.' },
      { day: 3, title: 'Sangu and return', detail: 'Sangu river boat ride, Nilachal at sunset, night coach to Dhaka.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 8900,
    departureDays: ['Wednesday', 'Friday'], bestSeason: 'September – March', groupSize: '10 – 26 travellers',
    operatorCode: 'OP006', coachLabel: 'S Alam AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'shah.jpg', rating: 4.7, totalReviews: 121,
  },
  {
    code: 'TP007',
    title: 'Saint Martin Island Getaway',
    destination: 'Teknaf',
    category: 'Island',
    summary: 'The only coral island in Bangladesh — a night on Chera Dwip with clear water and stars.',
    description:
      'Coach to Teknaf, ship across to Saint Martin, then a night on the island itself. Cycle to Chera Dwip at low tide, snorkel the coral shelf and eat grilled fish on the beach under a sky with no light pollution.',
    highlights: ['Ship crossing from Teknaf', 'Chera Dwip at low tide', 'Coral shelf snorkelling', 'Beachfront barbecue', 'Night sky over the Bay'],
    itinerary: [
      { day: 1, title: 'Dhaka to Teknaf', detail: 'Night coach to Teknaf, morning ship to Saint Martin, island check-in.' },
      { day: 2, title: 'Chera Dwip', detail: 'Cycle or walk to Chera Dwip, snorkelling, barbecue dinner on the sand.' },
      { day: 3, title: 'Return crossing', detail: 'Morning ship back to Teknaf, coach to Dhaka via Cox\'s Bazar.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 11500, oldPrice: 13000,
    departureDays: ['Thursday'], bestSeason: 'November – February', groupSize: '12 – 30 travellers',
    operatorCode: 'OP003', coachLabel: 'Shohag AC Sleeper', busType: 'Sleeper', acType: 'AC', seats: 24,
    image: 'Shogah.jpg', rating: 4.8, totalReviews: 177, isFeatured: true,
  },
  {
    code: 'TP008',
    title: 'Tanguar Haor Houseboat',
    destination: 'Sunamganj',
    category: 'River & Haor',
    summary: 'Two nights on a houseboat across the wetland, with the Meghalaya hills on the horizon.',
    description:
      'Tanguar Haor is a Ramsar wetland the size of a small district. The houseboat drifts between watch-towers and swamp forests, stopping at Niladri Lake, the Jadukata river and the Barikka Tila viewpoint under the Indian hills.',
    highlights: ['Houseboat across the haor', 'Niladri Lake', 'Jadukata river', 'Tekerghat lime quarry', 'Watowla swamp forest'],
    itinerary: [
      { day: 1, title: 'Dhaka to Sunamganj', detail: 'Night coach to Sunamganj, board the houseboat at Tahirpur.' },
      { day: 2, title: 'Across the haor', detail: 'Sail the wetland, swamp forest, Tekerghat and Niladri Lake at sunset.' },
      { day: 3, title: 'Jadukata and return', detail: 'Jadukata river and Barikka Tila, return to Sunamganj, night coach home.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 8200,
    departureDays: ['Thursday'], bestSeason: 'August – November', groupSize: '10 – 24 travellers',
    operatorCode: 'OP010', coachLabel: 'TR Travels AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'marsa.jpg', rating: 4.6, totalReviews: 74,
  },
  {
    code: 'TP009',
    title: 'Paharpur & Mahasthangarh Heritage',
    destination: 'Bogura',
    category: 'Heritage',
    summary: 'Two UNESCO-linked archaeological sites across the northern plains.',
    description:
      'Somapura Mahavihara at Paharpur is the largest Buddhist monastery south of the Himalayas, and Mahasthangarh near Bogura is the oldest urban site in Bangladesh. The route also takes in Kantajew Temple and the Mahasthan museum.',
    highlights: ['Somapura Mahavihara, Paharpur', 'Mahasthangarh citadel', 'Kantajew terracotta temple', 'Site museum collections', 'Bogura doi tasting'],
    itinerary: [
      { day: 1, title: 'Dhaka to Bogura', detail: 'Morning coach, Mahasthangarh citadel and museum in the afternoon.' },
      { day: 2, title: 'Paharpur and Kantajew', detail: 'Full day at Paharpur, then Kantajew temple, night coach home.' },
    ],
    durationDays: 2, durationNights: 1, pricePerPerson: 5800,
    departureDays: ['Friday'], bestSeason: 'October – March', groupSize: '12 – 34 travellers',
    operatorCode: 'OP011', coachLabel: 'Varendra AC Executive', busType: 'Executive', acType: 'AC', seats: 32,
    image: 'varendra express.jpg', rating: 4.4, totalReviews: 52,
  },
  {
    code: 'TP010',
    title: 'Rangamati Kaptai Lake Cruise',
    destination: 'Rangamati',
    category: 'River & Haor',
    summary: 'A day on the largest man-made lake in Bangladesh, with the hanging bridge and Shuvolong falls.',
    description:
      'Kaptai Lake spreads across the Rangamati hills. The tour covers the hanging bridge, a full-day boat to Shuvolong waterfall, the Chakma royal palace and the tribal textile market at Banarupa.',
    highlights: ['Kaptai Lake boat cruise', 'Rangamati hanging bridge', 'Shuvolong waterfall', 'Chakma Rajbari', 'Tribal textile market'],
    itinerary: [
      { day: 1, title: 'Dhaka to Rangamati', detail: 'Night coach, morning arrival, hanging bridge and lakeside lunch.' },
      { day: 2, title: 'Lake cruise', detail: 'Full-day boat to Shuvolong falls and Chakma Rajbari, night coach back.' },
    ],
    durationDays: 2, durationNights: 1, pricePerPerson: 6400,
    departureDays: ['Thursday', 'Saturday'], bestSeason: 'October – March', groupSize: '10 – 28 travellers',
    operatorCode: 'OP013', coachLabel: 'Orine AC Business', busType: 'Business', acType: 'AC', seats: 36,
    image: 'orinac.jpg', rating: 4.5, totalReviews: 63,
  },
  {
    code: 'TP011',
    title: 'Sylhet Jaflong & Ratargul',
    destination: 'Sylhet',
    category: 'Forest',
    summary: 'The freshwater swamp forest at Ratargul plus the stone-river valley at Jaflong.',
    description:
      'Ratargul is one of very few freshwater swamp forests in the world — you paddle between submerged tree trunks. Pair it with Jaflong on the Indian border, Bisnakandi and the shrine of Hazrat Shahjalal in the city.',
    highlights: ['Ratargul swamp forest canoe', 'Jaflong stone valley', 'Bisnakandi', 'Hazrat Shahjalal shrine', 'Lalakhal blue water'],
    itinerary: [
      { day: 1, title: 'Dhaka to Sylhet', detail: 'Night coach, shrine visit, then Ratargul swamp forest by canoe.' },
      { day: 2, title: 'Jaflong and Bisnakandi', detail: 'Full day at Jaflong and Bisnakandi, Lalakhal on the way back.' },
      { day: 3, title: 'Return', detail: 'Tea estate stop and city shopping, evening coach to Dhaka.' },
    ],
    durationDays: 3, durationNights: 2, pricePerPerson: 7600,
    departureDays: ['Wednesday', 'Friday'], bestSeason: 'June – October', groupSize: '12 – 30 travellers',
    operatorCode: 'OP005', coachLabel: 'Ena AC Executive', busType: 'Executive', acType: 'AC', seats: 32,
    image: 'ena.jpg', rating: 4.7, totalReviews: 134,
  },
  {
    code: 'TP012',
    title: 'Panchagarh Tetulia Kanchenjunga View',
    destination: 'Panchagarh',
    category: 'Heritage',
    summary: 'On clear autumn mornings, Kanchenjunga is visible from the northernmost tip of Bangladesh.',
    description:
      'From October to November the third-highest mountain in the world shows on the horizon at Tetulia. The trip adds Banglabandha zero point, the Mahananda riverbed and the tea gardens that now cover the northern plateau.',
    highlights: ['Kanchenjunga at sunrise', 'Banglabandha zero point', 'Mahananda river bed', 'Northern tea gardens', 'Bhitargarh fort ruins'],
    itinerary: [
      { day: 1, title: 'Dhaka to Panchagarh', detail: 'Night AC sleeper to Panchagarh, on to Tetulia for the afternoon.' },
      { day: 2, title: 'Mountain sunrise', detail: 'Dawn Kanchenjunga viewing, Banglabandha, tea gardens, night coach home.' },
    ],
    durationDays: 2, durationNights: 1, pricePerPerson: 6900,
    departureDays: ['Thursday'], bestSeason: 'October – November', groupSize: '10 – 26 travellers',
    operatorCode: 'OP004', coachLabel: 'Shyamoli AC Sleeper', busType: 'Sleeper', acType: 'AC', seats: 24,
    image: 'shyamoli.jpg', rating: 4.6, totalReviews: 47,
  },
];

export async function seedTours(
  operators: Map<string, { _id: mongoose.Types.ObjectId }>,
  imageUrls: Record<string, string>,
) {
  const operations = TOURS.map((tour) => {
    const operator = operators.get(tour.operatorCode);
    const stop = STOP_BY_NAME.get(tour.destination);
    const image = imageUrls[tour.image];

    return {
      updateOne: {
        filter: { code: tour.code },
        update: {
          $set: {
            code: tour.code,
            title: tour.title,
            slug: slugify(tour.title),
            destination: tour.destination,
            destinationBn: stop?.bn ?? tour.destination,
            division: stop?.division ?? 'Dhaka',
            category: tour.category,
            summary: tour.summary,
            description: tour.description,
            highlights: tour.highlights,
            itinerary: tour.itinerary,
            inclusions: STANDARD_INCLUSIONS,
            exclusions: STANDARD_EXCLUSIONS,
            durationDays: tour.durationDays,
            durationNights: tour.durationNights,
            pricePerPerson: tour.pricePerPerson,
            oldPrice: tour.oldPrice,
            departureCity: 'Dhaka',
            departureDays: tour.departureDays,
            bestSeason: tour.bestSeason,
            groupSize: tour.groupSize,
            operator: operator?._id,
            coachLabel: tour.coachLabel,
            busType: tour.busType,
            acType: tour.acType,
            seats: tour.seats,
            coverImage: image,
            images: image ? [image] : [],
            rating: tour.rating,
            totalReviews: tour.totalReviews,
            isFeatured: tour.isFeatured ?? false,
            isActive: true,
          },
        },
        upsert: true,
      },
    };
  });

  await TourPackage.bulkWrite(operations, { ordered: false });
  logger.info(`Tour packages seeded: ${TOURS.length}`);
}
