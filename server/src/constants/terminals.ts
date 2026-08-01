/**
 * Every bus terminal, counter and boarding point in the network.
 *
 * One entry per physical location, keyed by district. Coordinates are real
 * terminal positions where well known and district-centre approximations
 * elsewhere. Phone numbers are sample counter numbers — the platform's own
 * hotline is the only number used for payments.
 */

export interface TerminalSeed {
  /** Stable identifier, e.g. TRM-DHK-001. */
  id: string;
  district: string;
  /** Upazila / thana the terminal sits in. */
  upazila: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  /** 'terminal' = full bus terminal, 'counter' = ticket counter/pickup point. */
  kind: 'terminal' | 'counter';
  /** Minutes before departure a passenger should arrive here. */
  reportingMinutes: number;
  isActive: boolean;
}

/** Sample counter numbers, cycled deterministically so the seed is stable. */
const PHONE_POOL = [
  '01711-000101', '01711-000102', '01711-000103', '01711-000104',
  '01811-000201', '01811-000202', '01811-000203', '01811-000204',
  '01911-000301', '01911-000302', '01911-000303', '01911-000304',
  '01611-000401', '01611-000402', '01611-000403', '01611-000404',
];

let phoneCursor = 0;
function nextPhone(): string {
  const phone = PHONE_POOL[phoneCursor % PHONE_POOL.length];
  phoneCursor += 1;
  return phone;
}

interface RawTerminal {
  upazila: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  kind?: 'terminal' | 'counter';
  reportingMinutes?: number;
  isActive?: boolean;
}

/**
 * District -> its terminals. Divisional cities and tourist hubs carry the real
 * named terminals; smaller districts get their central terminal plus the
 * counter road that intercity coaches actually stop at.
 */
const RAW: Record<string, RawTerminal[]> = {
  /* ================= ঢাকা বিভাগ ================= */
  Dhaka: [
    { upazila: 'Mirpur', name: 'Gabtoli Bus Terminal', address: 'Gabtoli, Mirpur, Dhaka 1216', lat: 23.7806, lng: 90.3405, reportingMinutes: 30 },
    { upazila: 'Mirpur', name: 'Kalyanpur Counter', address: 'Kalyanpur Bus Stand, Mirpur Road, Dhaka 1207', lat: 23.7789, lng: 90.3573, kind: 'counter' },
    { upazila: 'Sabujbagh', name: 'Sayedabad Bus Terminal', address: 'Sayedabad, Jatrabari, Dhaka 1204', lat: 23.7106, lng: 90.4331, reportingMinutes: 30 },
    { upazila: 'Jatrabari', name: 'Jatrabari Counter', address: 'Jatrabari Chourasta, Dhaka 1204', lat: 23.7104, lng: 90.4419, kind: 'counter' },
    { upazila: 'Tejgaon', name: 'Mohakhali Bus Terminal', address: 'Mohakhali, Gulshan, Dhaka 1212', lat: 23.7793, lng: 90.4053, reportingMinutes: 30 },
    { upazila: 'Motijheel', name: 'Arambagh Counter', address: 'Arambagh, Motijheel, Dhaka 1000', lat: 23.7331, lng: 90.4176, kind: 'counter' },
    { upazila: 'Motijheel', name: 'Fakirapool Counter', address: 'Fakirapool Bus Stand, Motijheel, Dhaka 1000', lat: 23.7345, lng: 90.4147, kind: 'counter' },
    { upazila: 'Uttara', name: 'Abdullahpur Counter', address: 'Abdullahpur, Uttara, Dhaka 1230', lat: 23.8767, lng: 90.4011, kind: 'counter', reportingMinutes: 25 },
    { upazila: 'Uttara', name: 'Airport Counter', address: 'Hazrat Shahjalal Airport Road, Dhaka 1229', lat: 23.8433, lng: 90.3978, kind: 'counter', reportingMinutes: 25 },
    { upazila: 'Badda', name: 'Rampura Bridge Counter', address: 'Rampura Bridge, Badda, Dhaka 1219', lat: 23.7631, lng: 90.4225, kind: 'counter' },
  ],
  Faridpur: [
    { upazila: 'Faridpur Sadar', name: 'Faridpur Bus Terminal', address: 'Goalchamot, Faridpur Sadar, Faridpur 7800', lat: 23.6019, lng: 89.8322 },
    { upazila: 'Bhanga', name: 'Bhanga Counter', address: 'Bhanga Bus Stand, Bhanga, Faridpur 7830', lat: 23.3902, lng: 89.9601, kind: 'counter' },
  ],
  Gazipur: [
    { upazila: 'Gazipur Sadar', name: 'Gazipur Chourasta Terminal', address: 'Chourasta, Joydebpur, Gazipur 1700', lat: 23.9999, lng: 90.4203 },
    { upazila: 'Tongi', name: 'Tongi Counter', address: 'Tongi Bus Stand, Tongi, Gazipur 1710', lat: 23.8917, lng: 90.4053, kind: 'counter' },
    { upazila: 'Kaliakair', name: 'Kaliakair Counter', address: 'Chandra, Kaliakair, Gazipur 1750', lat: 24.0678, lng: 90.2214, kind: 'counter' },
  ],
  Gopalganj: [
    { upazila: 'Gopalganj Sadar', name: 'Gopalganj Bus Terminal', address: 'Pouro Park Road, Gopalganj Sadar 8100', lat: 23.0051, lng: 89.8266 },
    { upazila: 'Tungipara', name: 'Tungipara Counter', address: 'Tungipara Bus Stand, Gopalganj 8130', lat: 22.9034, lng: 89.8875, kind: 'counter' },
  ],
  Kishoreganj: [
    { upazila: 'Kishoreganj Sadar', name: 'Kishoreganj Bus Terminal', address: 'Gaital, Kishoreganj Sadar 2300', lat: 24.4449, lng: 90.7766 },
    { upazila: 'Bhairab', name: 'Bhairab Counter', address: 'Bhairab Bazar, Bhairab, Kishoreganj 2350', lat: 24.0517, lng: 90.9787, kind: 'counter' },
  ],
  Madaripur: [
    { upazila: 'Madaripur Sadar', name: 'Madaripur Bus Terminal', address: 'Puran Bazar, Madaripur Sadar 7900', lat: 23.1641, lng: 90.1897 },
    { upazila: 'Shibchar', name: 'Shibchar Counter', address: 'Shibchar Bus Stand, Madaripur 7930', lat: 23.3452, lng: 90.1499, kind: 'counter' },
  ],
  Manikganj: [
    { upazila: 'Manikganj Sadar', name: 'Manikganj Bus Terminal', address: 'Bus Stand Road, Manikganj Sadar 1800', lat: 23.8617, lng: 90.0003 },
    { upazila: 'Shivalaya', name: 'Paturia Ghat Counter', address: 'Paturia Ferry Ghat, Shivalaya, Manikganj', lat: 23.7784, lng: 89.7842, kind: 'counter' },
  ],
  Munshiganj: [
    { upazila: 'Munshiganj Sadar', name: 'Munshiganj Bus Terminal', address: 'Muktarpur Road, Munshiganj Sadar 1500', lat: 23.5422, lng: 90.5305 },
    { upazila: 'Louhajang', name: 'Mawa Ghat Counter', address: 'Mawa, Louhajang, Munshiganj 1530', lat: 23.4197, lng: 90.2698, kind: 'counter' },
  ],
  Narayanganj: [
    { upazila: 'Narayanganj Sadar', name: 'Narayanganj Bus Terminal', address: 'Chashara, Narayanganj Sadar 1400', lat: 23.6238, lng: 90.4995 },
    { upazila: 'Siddhirganj', name: 'Signboard Counter', address: 'Signboard, Siddhirganj, Narayanganj 1430', lat: 23.6905, lng: 90.4941, kind: 'counter' },
  ],
  Narsingdi: [
    { upazila: 'Narsingdi Sadar', name: 'Narsingdi Bus Terminal', address: 'Bus Stand Road, Narsingdi Sadar 1600', lat: 23.9223, lng: 90.7178 },
    { upazila: 'Madhabdi', name: 'Madhabdi Counter', address: 'Madhabdi Bazar, Narsingdi 1604', lat: 23.8478, lng: 90.6597, kind: 'counter' },
  ],
  Rajbari: [
    { upazila: 'Rajbari Sadar', name: 'Rajbari Bus Terminal', address: 'Boro Bazar, Rajbari Sadar 7700', lat: 23.7574, lng: 89.6445 },
    { upazila: 'Goalanda', name: 'Daulatdia Ghat Counter', address: 'Daulatdia Ferry Ghat, Goalanda, Rajbari', lat: 23.7043, lng: 89.7472, kind: 'counter' },
  ],
  Shariatpur: [
    { upazila: 'Shariatpur Sadar', name: 'Shariatpur Bus Terminal', address: 'Palong, Shariatpur Sadar 8000', lat: 23.2073, lng: 90.3468 },
    { upazila: 'Zajira', name: 'Zajira Counter', address: 'Zajira Bus Stand, Shariatpur 8010', lat: 23.3679, lng: 90.3345, kind: 'counter' },
  ],
  Tangail: [
    { upazila: 'Tangail Sadar', name: 'Tangail Bus Terminal', address: 'Nirala Mor, Tangail Sadar 1900', lat: 24.2513, lng: 89.9167 },
    { upazila: 'Kalihati', name: 'Elenga Counter', address: 'Elenga Bazar, Kalihati, Tangail 1970', lat: 24.3352, lng: 89.9271, kind: 'counter' },
    { upazila: 'Mirzapur', name: 'Mirzapur Counter', address: 'Mirzapur Bus Stand, Tangail 1940', lat: 24.1042, lng: 90.0982, kind: 'counter' },
  ],

  /* ================= চট্টগ্রাম বিভাগ ================= */
  Chattogram: [
    { upazila: 'Chandgaon', name: 'Bahaddarhat Bus Terminal', address: 'Bahaddarhat, Chandgaon, Chattogram 4000', lat: 22.3653, lng: 91.8394, reportingMinutes: 30 },
    { upazila: 'Pahartali', name: 'AK Khan Counter', address: 'AK Khan Mor, Pahartali, Chattogram 4202', lat: 22.3771, lng: 91.7969, kind: 'counter' },
    { upazila: 'Kotwali', name: 'Dampara Counter', address: 'Dampara Police Line Road, Kotwali, Chattogram 4000', lat: 22.3448, lng: 91.8256, kind: 'counter' },
    { upazila: 'Panchlaish', name: 'GEC Circle Counter', address: 'GEC Circle, Panchlaish, Chattogram 4000', lat: 22.3596, lng: 91.8214, kind: 'counter' },
    { upazila: 'Double Mooring', name: 'Kadamtali BRTC Terminal', address: 'Kadamtali, Double Mooring, Chattogram 4100', lat: 22.3312, lng: 91.8358 },
  ],
  "Cox's Bazar": [
    { upazila: "Cox's Bazar Sadar", name: 'Kolatoli Bus Terminal', address: "Kolatoli Road, Cox's Bazar Sadar 4700", lat: 21.4189, lng: 92.0022, reportingMinutes: 30 },
    { upazila: "Cox's Bazar Sadar", name: 'Laboni Beach Counter', address: "Laboni Point, Cox's Bazar 4700", lat: 21.4272, lng: 91.9789, kind: 'counter' },
    { upazila: "Cox's Bazar Sadar", name: "Cox's Bazar Central Bus Stand", address: "Bus Terminal Road, Cox's Bazar Sadar 4700", lat: 21.4453, lng: 91.9756 },
    { upazila: 'Chakaria', name: 'Chiringa Counter', address: 'Chiringa Bazar, Chakaria, Cox\'s Bazar 4741', lat: 21.7796, lng: 92.0812, kind: 'counter' },
  ],
  Bandarban: [
    { upazila: 'Bandarban Sadar', name: 'Bandarban Bus Terminal', address: 'Balaghata Road, Bandarban Sadar 4600', lat: 22.1953, lng: 92.2184 },
    { upazila: 'Bandarban Sadar', name: 'Meghla Counter', address: 'Meghla Tourist Spot, Bandarban 4600', lat: 22.1687, lng: 92.2043, kind: 'counter' },
  ],
  Brahmanbaria: [
    { upazila: 'Brahmanbaria Sadar', name: 'Brahmanbaria Bus Terminal', address: 'Kautali, Brahmanbaria Sadar 3400', lat: 23.9571, lng: 91.1119 },
    { upazila: 'Ashuganj', name: 'Ashuganj Counter', address: 'Ashuganj Bazar, Brahmanbaria 3402', lat: 24.0396, lng: 91.0121, kind: 'counter' },
  ],
  Chandpur: [
    { upazila: 'Chandpur Sadar', name: 'Chandpur Bus Terminal', address: 'Bus Stand Road, Chandpur Sadar 3600', lat: 23.2295, lng: 90.6512 },
    { upazila: 'Hajiganj', name: 'Hajiganj Counter', address: 'Hajiganj Bazar, Chandpur 3610', lat: 23.2528, lng: 90.8546, kind: 'counter' },
  ],
  Cumilla: [
    { upazila: 'Cumilla Sadar', name: 'Cumilla Bus Terminal', address: 'Padua Bazar Bishwa Road, Cumilla Sadar 3500', lat: 23.4363, lng: 91.1809 },
    { upazila: 'Cumilla Sadar', name: 'Kandirpar Counter', address: 'Kandirpar, Cumilla 3500', lat: 23.4607, lng: 91.1809, kind: 'counter' },
    { upazila: 'Cumilla Sadar Dakshin', name: 'Cumilla Cantonment Counter', address: 'Cantonment Gate, Cumilla 3501', lat: 23.4029, lng: 91.1461, kind: 'counter' },
    { upazila: 'Chauddagram', name: 'Chauddagram Counter', address: 'Chauddagram Bazar, Cumilla 3550', lat: 23.2247, lng: 91.2986, kind: 'counter' },
  ],
  Feni: [
    { upazila: 'Feni Sadar', name: 'Feni Mohipal Bus Terminal', address: 'Mohipal, Feni Sadar 3900', lat: 23.0204, lng: 91.3968 },
    { upazila: 'Feni Sadar', name: 'Feni Trunk Road Counter', address: 'Trunk Road, Feni 3900', lat: 23.0159, lng: 91.3963, kind: 'counter' },
  ],
  Khagrachhari: [
    { upazila: 'Khagrachhari Sadar', name: 'Khagrachhari Bus Terminal', address: 'Shapla Chattar, Khagrachhari Sadar 4400', lat: 23.1193, lng: 91.9847 },
    { upazila: 'Dighinala', name: 'Dighinala Counter', address: 'Dighinala Bazar, Khagrachhari 4420', lat: 23.2331, lng: 92.0672, kind: 'counter' },
  ],
  Lakshmipur: [
    { upazila: 'Lakshmipur Sadar', name: 'Lakshmipur Bus Terminal', address: 'Jhumur Mor, Lakshmipur Sadar 3700', lat: 22.9425, lng: 90.8412 },
    { upazila: 'Raipur', name: 'Raipur Counter', address: 'Raipur Bazar, Lakshmipur 3710', lat: 23.0333, lng: 90.7667, kind: 'counter' },
  ],
  Noakhali: [
    { upazila: 'Noakhali Sadar', name: 'Maijdee Bus Terminal', address: 'Maijdee Court, Noakhali Sadar 3800', lat: 22.8697, lng: 91.0993 },
    { upazila: 'Begumganj', name: 'Chowmuhani Counter', address: 'Chowmuhani Bazar, Begumganj, Noakhali 3821', lat: 22.8697, lng: 91.1103, kind: 'counter' },
    { upazila: 'Sudharam', name: 'Sonapur Counter', address: 'Sonapur, Noakhali Sadar 3814', lat: 22.8022, lng: 91.1017, kind: 'counter' },
  ],
  Rangamati: [
    { upazila: 'Rangamati Sadar', name: 'Rangamati Bus Terminal', address: 'Reserve Bazar, Rangamati Sadar 4500', lat: 22.6533, lng: 92.1747 },
    { upazila: 'Kaptai', name: 'Kaptai Lake Counter', address: 'Kaptai Lake Point, Rangamati 4530', lat: 22.4958, lng: 92.2189, kind: 'counter' },
  ],
  Teknaf: [
    { upazila: 'Teknaf', name: 'Teknaf Bus Stand', address: 'Teknaf Bazar, Teknaf, Cox\'s Bazar 4760', lat: 20.8626, lng: 92.3058 },
    { upazila: 'Teknaf', name: 'Teknaf Jetty Ghat Counter', address: 'Teknaf Jetty, Naf River, Teknaf 4760', lat: 20.8567, lng: 92.3081, kind: 'counter' },
  ],
  Sajek: [
    { upazila: 'Baghaichhari', name: 'Sajek Ruilui Para Counter', address: 'Ruilui Para, Sajek Valley, Baghaichhari 4590', lat: 23.3818, lng: 92.2937, kind: 'counter', reportingMinutes: 40 },
  ],

  /* ================= খুলনা বিভাগ ================= */
  Khulna: [
    { upazila: 'Khulna Sadar', name: 'Sonadanga Bus Terminal', address: 'Sonadanga, Khulna Sadar 9100', lat: 22.8135, lng: 89.5401, reportingMinutes: 30 },
    { upazila: 'Khulna Sadar', name: 'Royal Mor Counter', address: 'Royal Mor, KDA Avenue, Khulna 9100', lat: 22.8158, lng: 89.5651, kind: 'counter' },
    { upazila: 'Khalishpur', name: 'Notun Rasta Counter', address: 'Notun Rasta, Khalishpur, Khulna 9000', lat: 22.8403, lng: 89.5296, kind: 'counter' },
  ],
  Bagerhat: [
    { upazila: 'Bagerhat Sadar', name: 'Bagerhat Bus Terminal', address: 'Rahat Ali Road, Bagerhat Sadar 9300', lat: 22.6516, lng: 89.7859 },
    { upazila: 'Mongla', name: 'Mongla Port Counter', address: 'Mongla Port Road, Bagerhat 9351', lat: 22.4877, lng: 89.5992, kind: 'counter' },
  ],
  Chuadanga: [
    { upazila: 'Chuadanga Sadar', name: 'Chuadanga Bus Terminal', address: 'Bus Stand Road, Chuadanga Sadar 7200', lat: 23.6402, lng: 88.8412 },
    { upazila: 'Damurhuda', name: 'Darshana Counter', address: 'Darshana Bazar, Damurhuda, Chuadanga 7220', lat: 23.5333, lng: 88.8167, kind: 'counter' },
  ],
  Jashore: [
    { upazila: 'Jashore Sadar', name: 'Monihar Bus Terminal', address: 'Monihar, Jashore Sadar 7400', lat: 23.1591, lng: 89.2166 },
    { upazila: 'Jashore Sadar', name: 'Chanchra Counter', address: 'Chanchra Mor, Jashore 7400', lat: 23.1454, lng: 89.2029, kind: 'counter' },
    { upazila: 'Jashore Sadar', name: 'Palbari Counter', address: 'Palbari Mor, Jashore 7400', lat: 23.1725, lng: 89.1902, kind: 'counter' },
  ],
  Benapole: [
    { upazila: 'Sharsha', name: 'Benapole Port Bus Terminal', address: 'Benapole Land Port, Sharsha, Jashore 7431', lat: 23.0433, lng: 88.9339, reportingMinutes: 40 },
    { upazila: 'Sharsha', name: 'Benapole Checkpost Counter', address: 'Benapole Checkpost, Jashore 7431', lat: 23.0392, lng: 88.9243, kind: 'counter' },
  ],
  Jhenaidah: [
    { upazila: 'Jhenaidah Sadar', name: 'Jhenaidah Bus Terminal', address: 'Arappur, Jhenaidah Sadar 7300', lat: 23.5448, lng: 89.1539 },
    { upazila: 'Kaliganj', name: 'Kaliganj Counter', address: 'Kaliganj Bazar, Jhenaidah 7350', lat: 23.4167, lng: 89.1333, kind: 'counter' },
  ],
  Kushtia: [
    { upazila: 'Kushtia Sadar', name: 'Kushtia Bus Terminal', address: 'Mazampur Gate, Kushtia Sadar 7000', lat: 23.9013, lng: 89.1206 },
    { upazila: 'Kumarkhali', name: 'Kumarkhali Counter', address: 'Kumarkhali Bazar, Kushtia 7010', lat: 23.8628, lng: 89.2419, kind: 'counter' },
  ],
  Magura: [
    { upazila: 'Magura Sadar', name: 'Magura Bus Terminal', address: 'Bus Stand Road, Magura Sadar 7600', lat: 23.4855, lng: 89.4198 },
  ],
  Meherpur: [
    { upazila: 'Meherpur Sadar', name: 'Meherpur Bus Terminal', address: 'Bus Stand, Meherpur Sadar 7100', lat: 23.7622, lng: 88.6318 },
    { upazila: 'Mujibnagar', name: 'Mujibnagar Counter', address: 'Mujibnagar Complex Road, Meherpur 7102', lat: 23.6417, lng: 88.6483, kind: 'counter' },
  ],
  Narail: [
    { upazila: 'Narail Sadar', name: 'Narail Bus Terminal', address: 'Rupganj, Narail Sadar 7500', lat: 23.1725, lng: 89.5126 },
  ],
  Satkhira: [
    { upazila: 'Satkhira Sadar', name: 'Satkhira Bus Terminal', address: 'Sultanpur, Satkhira Sadar 9400', lat: 22.7185, lng: 89.0705 },
    { upazila: 'Shyamnagar', name: 'Shyamnagar Counter', address: 'Shyamnagar Bazar, Satkhira 9455', lat: 22.3269, lng: 89.1064, kind: 'counter' },
  ],

  /* ================= রাজশাহী বিভাগ ================= */
  Rajshahi: [
    { upazila: 'Rajpara', name: 'Shiroil Bus Terminal', address: 'Shiroil Colony, Rajpara, Rajshahi 6000', lat: 24.3714, lng: 88.5978, reportingMinutes: 30 },
    { upazila: 'Boalia', name: 'Shaheb Bazar Counter', address: 'Shaheb Bazar Zero Point, Boalia, Rajshahi 6100', lat: 24.3639, lng: 88.6044, kind: 'counter' },
    { upazila: 'Rajpara', name: 'Rajshahi Rail Gate Counter', address: 'Rail Gate, Rajpara, Rajshahi 6000', lat: 24.3745, lng: 88.6019, kind: 'counter' },
  ],
  Bogura: [
    { upazila: 'Bogura Sadar', name: 'Charmatha Bus Terminal', address: 'Charmatha, Bogura Sadar 5800', lat: 24.8398, lng: 89.3714 },
    { upazila: 'Bogura Sadar', name: 'Satmatha Counter', address: 'Satmatha, Bogura Sadar 5800', lat: 24.8481, lng: 89.3719, kind: 'counter' },
    { upazila: 'Shibganj', name: 'Mokamtola Counter', address: 'Mokamtola Bazar, Shibganj, Bogura 5820', lat: 24.9911, lng: 89.3372, kind: 'counter' },
  ],
  Chapainawabganj: [
    { upazila: 'Chapainawabganj Sadar', name: 'Chapainawabganj Bus Terminal', address: 'Bus Terminal Road, Chapainawabganj Sadar 6300', lat: 24.5965, lng: 88.2775 },
    { upazila: 'Shibganj', name: 'Sonamasjid Counter', address: 'Sonamasjid Land Port, Shibganj 6340', lat: 24.7089, lng: 88.1319, kind: 'counter' },
  ],
  Joypurhat: [
    { upazila: 'Joypurhat Sadar', name: 'Joypurhat Bus Terminal', address: 'Bus Stand Road, Joypurhat Sadar 5900', lat: 25.0968, lng: 89.0227 },
  ],
  Naogaon: [
    { upazila: 'Naogaon Sadar', name: 'Naogaon Bus Terminal', address: 'Balubazar, Naogaon Sadar 6500', lat: 24.7936, lng: 88.9318 },
    { upazila: 'Patnitala', name: 'Nozipur Counter', address: 'Nozipur Bazar, Patnitala, Naogaon 6540', lat: 25.0442, lng: 88.7889, kind: 'counter' },
  ],
  Natore: [
    { upazila: 'Natore Sadar', name: 'Natore Bus Terminal', address: 'Madrasa Mor, Natore Sadar 6400', lat: 24.4206, lng: 88.9878 },
    { upazila: 'Bagatipara', name: 'Banpara Counter', address: 'Banpara Bazar, Bagatipara, Natore 6431', lat: 24.2833, lng: 89.0333, kind: 'counter' },
  ],
  Pabna: [
    { upazila: 'Pabna Sadar', name: 'Pabna Bus Terminal', address: 'Boro Bazar, Pabna Sadar 6600', lat: 24.0064, lng: 89.2372 },
    { upazila: 'Ishwardi', name: 'Ishwardi Counter', address: 'Ishwardi Bazar, Pabna 6620', lat: 24.1333, lng: 89.0667, kind: 'counter' },
  ],
  Sirajganj: [
    { upazila: 'Sirajganj Sadar', name: 'Sirajganj Bus Terminal', address: 'Bagbati, Sirajganj Sadar 6700', lat: 24.4533, lng: 89.7006 },
    { upazila: 'Shahjadpur', name: 'Hatikumrul Counter', address: 'Hatikumrul Mor, Shahjadpur, Sirajganj 6770', lat: 24.3253, lng: 89.5789, kind: 'counter' },
  ],

  /* ================= সিলেট বিভাগ ================= */
  Sylhet: [
    { upazila: 'Sylhet Sadar', name: 'Kadamtali Bus Terminal', address: 'Kadamtali, South Surma, Sylhet 3100', lat: 24.8862, lng: 91.8712, reportingMinutes: 30 },
    { upazila: 'Sylhet Sadar', name: 'Amberkhana Counter', address: 'Amberkhana Point, Sylhet 3100', lat: 24.9086, lng: 91.8686, kind: 'counter' },
    { upazila: 'Sylhet Sadar', name: 'Sobhanighat Counter', address: 'Sobhanighat, Sylhet 3100', lat: 24.8905, lng: 91.8768, kind: 'counter' },
  ],
  Habiganj: [
    { upazila: 'Habiganj Sadar', name: 'Habiganj Bus Terminal', address: 'Shayestanagar, Habiganj Sadar 3300', lat: 24.3745, lng: 91.4155 },
    { upazila: 'Madhabpur', name: 'Madhabpur Counter', address: 'Madhabpur Bazar, Habiganj 3330', lat: 24.1167, lng: 91.2833, kind: 'counter' },
  ],
  Moulvibazar: [
    { upazila: 'Moulvibazar Sadar', name: 'Moulvibazar Bus Terminal', address: 'Central Road, Moulvibazar Sadar 3200', lat: 24.4829, lng: 91.7774 },
    { upazila: 'Kulaura', name: 'Kulaura Counter', address: 'Kulaura Bazar, Moulvibazar 3230', lat: 24.5267, lng: 92.0369, kind: 'counter' },
  ],
  Srimangal: [
    { upazila: 'Srimangal', name: 'Srimangal Bus Stand', address: 'Station Road, Srimangal, Moulvibazar 3210', lat: 24.3065, lng: 91.7296 },
    { upazila: 'Srimangal', name: 'Tea Garden Counter', address: 'Bhanugach Road, Srimangal 3210', lat: 24.2938, lng: 91.7204, kind: 'counter' },
  ],
  Sunamganj: [
    { upazila: 'Sunamganj Sadar', name: 'Sunamganj Bus Terminal', address: 'Ticket Counter Road, Sunamganj Sadar 3000', lat: 25.0658, lng: 91.3950 },
    { upazila: 'Tahirpur', name: 'Tanguar Haor Counter', address: 'Tahirpur Bazar, Sunamganj 3030', lat: 25.0819, lng: 91.1728, kind: 'counter' },
  ],

  /* ================= রংপুর বিভাগ ================= */
  Rangpur: [
    { upazila: 'Rangpur Sadar', name: 'Kamarpara Bus Terminal', address: 'Kamarpara, Rangpur Sadar 5400', lat: 25.7439, lng: 89.2752, reportingMinutes: 30 },
    { upazila: 'Rangpur Sadar', name: 'Modern Mor Counter', address: 'Modern Mor, Rangpur 5400', lat: 25.7558, lng: 89.2444, kind: 'counter' },
    { upazila: 'Rangpur Sadar', name: 'Medical Mor Counter', address: 'Medical East Gate, Rangpur 5400', lat: 25.7361, lng: 89.2694, kind: 'counter' },
  ],
  Dinajpur: [
    { upazila: 'Dinajpur Sadar', name: 'Dinajpur Bus Terminal', address: 'Kotwali, Dinajpur Sadar 5200', lat: 25.6217, lng: 88.6354 },
    { upazila: 'Birampur', name: 'Birampur Counter', address: 'Birampur Bazar, Dinajpur 5266', lat: 25.4167, lng: 88.9667, kind: 'counter' },
    { upazila: 'Hakimpur', name: 'Hili Land Port Counter', address: 'Hili Land Port, Hakimpur, Dinajpur 5270', lat: 25.2833, lng: 89.0167, kind: 'counter' },
  ],
  Gaibandha: [
    { upazila: 'Gaibandha Sadar', name: 'Gaibandha Bus Terminal', address: 'DB Road, Gaibandha Sadar 5700', lat: 25.3288, lng: 89.5281 },
    { upazila: 'Gobindaganj', name: 'Gobindaganj Counter', address: 'Gobindaganj Bazar, Gaibandha 5740', lat: 25.1333, lng: 89.3833, kind: 'counter' },
  ],
  Kurigram: [
    { upazila: 'Kurigram Sadar', name: 'Kurigram Bus Terminal', address: 'Bus Stand Road, Kurigram Sadar 5600', lat: 25.8072, lng: 89.6362 },
  ],
  Lalmonirhat: [
    { upazila: 'Lalmonirhat Sadar', name: 'Lalmonirhat Bus Terminal', address: 'Mission Mor, Lalmonirhat Sadar 5500', lat: 25.9169, lng: 89.4506 },
    { upazila: 'Patgram', name: 'Burimari Land Port Counter', address: 'Burimari, Patgram, Lalmonirhat 5540', lat: 26.4333, lng: 88.9167, kind: 'counter' },
  ],
  Nilphamari: [
    { upazila: 'Nilphamari Sadar', name: 'Nilphamari Bus Terminal', address: 'Bus Stand Road, Nilphamari Sadar 5300', lat: 25.9317, lng: 88.8560 },
    { upazila: 'Saidpur', name: 'Saidpur Counter', address: 'Saidpur Bazar, Nilphamari 5310', lat: 25.7783, lng: 88.8917, kind: 'counter' },
  ],
  Panchagarh: [
    { upazila: 'Panchagarh Sadar', name: 'Panchagarh Bus Terminal', address: 'Bus Terminal Road, Panchagarh Sadar 5000', lat: 26.3411, lng: 88.5542 },
    { upazila: 'Tetulia', name: 'Tetulia Counter', address: 'Tetulia Bazar, Panchagarh 5030', lat: 26.5000, lng: 88.3833, kind: 'counter' },
  ],
  Thakurgaon: [
    { upazila: 'Thakurgaon Sadar', name: 'Thakurgaon Bus Terminal', address: 'Chowrasta, Thakurgaon Sadar 5100', lat: 26.0336, lng: 88.4616 },
  ],

  /* ================= ময়মনসিংহ বিভাগ ================= */
  Mymensingh: [
    { upazila: 'Mymensingh Sadar', name: 'Masakanda Bus Terminal', address: 'Masakanda, Mymensingh Sadar 2200', lat: 24.7357, lng: 90.3928, reportingMinutes: 30 },
    { upazila: 'Mymensingh Sadar', name: 'Town Hall Counter', address: 'Town Hall Mor, Mymensingh 2200', lat: 24.7539, lng: 90.4033, kind: 'counter' },
    { upazila: 'Mymensingh Sadar', name: 'Charpara Counter', address: 'Charpara, Mymensingh 2200', lat: 24.7472, lng: 90.4025, kind: 'counter' },
  ],
  Jamalpur: [
    { upazila: 'Jamalpur Sadar', name: 'Jamalpur Bus Terminal', address: 'Bus Stand Road, Jamalpur Sadar 2000', lat: 24.9375, lng: 89.9378 },
    { upazila: 'Sarishabari', name: 'Sarishabari Counter', address: 'Sarishabari Bazar, Jamalpur 2050', lat: 24.7333, lng: 89.8333, kind: 'counter' },
  ],
  Netrokona: [
    { upazila: 'Netrokona Sadar', name: 'Netrokona Bus Terminal', address: 'Choto Bazar, Netrokona Sadar 2400', lat: 24.8808, lng: 90.7279 },
    { upazila: 'Durgapur', name: 'Birishiri Counter', address: 'Birishiri, Durgapur, Netrokona 2440', lat: 25.1167, lng: 90.6333, kind: 'counter' },
  ],
  Sherpur: [
    { upazila: 'Sherpur Sadar', name: 'Sherpur Bus Terminal', address: 'Nayani Bazar, Sherpur Sadar 2100', lat: 25.0205, lng: 90.0153 },
    { upazila: 'Jhenaigati', name: 'Gajni Counter', address: 'Gajni Avakash Kendra, Jhenaigati, Sherpur 2120', lat: 25.1667, lng: 90.1000, kind: 'counter' },
  ],

  /* ================= বরিশাল বিভাগ ================= */
  Barishal: [
    { upazila: 'Barishal Sadar', name: 'Nathullabad Bus Terminal', address: 'Nathullabad, Barishal Sadar 8200', lat: 22.7169, lng: 90.3532, reportingMinutes: 30 },
    { upazila: 'Barishal Sadar', name: 'Rupatoli Bus Terminal', address: 'Rupatoli, Barishal Sadar 8200', lat: 22.6773, lng: 90.3564 },
    { upazila: 'Barishal Sadar', name: 'Launch Ghat Counter', address: 'Barishal Launch Terminal Road, Barishal 8200', lat: 22.7047, lng: 90.3722, kind: 'counter' },
  ],
  Barguna: [
    { upazila: 'Barguna Sadar', name: 'Barguna Bus Terminal', address: 'Bus Stand Road, Barguna Sadar 8700', lat: 22.0953, lng: 90.1121 },
    { upazila: 'Amtali', name: 'Amtali Counter', address: 'Amtali Bazar, Barguna 8710', lat: 22.1333, lng: 90.2333, kind: 'counter' },
  ],
  Bhola: [
    { upazila: 'Bhola Sadar', name: 'Bhola Bus Terminal', address: 'Bangla Bazar, Bhola Sadar 8300', lat: 22.6859, lng: 90.6482 },
    { upazila: 'Charfasson', name: 'Charfasson Counter', address: 'Charfasson Bazar, Bhola 8340', lat: 22.1833, lng: 90.7500, kind: 'counter' },
  ],
  Jhalokati: [
    { upazila: 'Jhalokati Sadar', name: 'Jhalokati Bus Terminal', address: 'Bus Stand Road, Jhalokati Sadar 8400', lat: 22.6406, lng: 90.1987 },
  ],
  Patuakhali: [
    { upazila: 'Patuakhali Sadar', name: 'Patuakhali Bus Terminal', address: 'New Market Road, Patuakhali Sadar 8600', lat: 22.3596, lng: 90.3298 },
    { upazila: 'Bauphal', name: 'Bauphal Counter', address: 'Bauphal Bazar, Patuakhali 8620', lat: 22.4667, lng: 90.5333, kind: 'counter' },
  ],
  Kuakata: [
    { upazila: 'Kalapara', name: 'Kuakata Bus Terminal', address: 'Kuakata Beach Road, Kalapara, Patuakhali 8650', lat: 21.8207, lng: 90.1194, reportingMinutes: 30 },
    { upazila: 'Kalapara', name: 'Kuakata Beach Point Counter', address: 'Zero Point, Kuakata Sea Beach 8650', lat: 21.8158, lng: 90.1206, kind: 'counter' },
  ],
  Pirojpur: [
    { upazila: 'Pirojpur Sadar', name: 'Pirojpur Bus Terminal', address: 'Bus Stand Road, Pirojpur Sadar 8500', lat: 22.5791, lng: 89.9759 },
    { upazila: 'Nazirpur', name: 'Swarupkathi Counter', address: 'Swarupkathi Bazar, Pirojpur 8520', lat: 22.6833, lng: 90.0500, kind: 'counter' },
  ],
};

/** District code fragment used inside terminal ids. */
function districtCode(district: string): string {
  return district
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase();
}

function buildTerminals(): TerminalSeed[] {
  phoneCursor = 0;
  const terminals: TerminalSeed[] = [];

  for (const [district, list] of Object.entries(RAW)) {
    list.forEach((raw, index) => {
      terminals.push({
        id: `TRM-${districtCode(district)}-${String(index + 1).padStart(3, '0')}`,
        district,
        upazila: raw.upazila,
        name: raw.name,
        address: raw.address,
        lat: raw.lat,
        lng: raw.lng,
        phone: nextPhone(),
        kind: raw.kind ?? 'terminal',
        reportingMinutes: raw.reportingMinutes ?? (raw.kind === 'counter' ? 20 : 25),
        isActive: raw.isActive ?? true,
      });
    });
  }

  return terminals;
}

export const TERMINALS: TerminalSeed[] = buildTerminals();

export const TERMINALS_BY_DISTRICT = TERMINALS.reduce<Record<string, TerminalSeed[]>>(
  (acc, terminal) => {
    (acc[terminal.district] ??= []).push(terminal);
    return acc;
  },
  {},
);

/** Districts with hand-written terminals; anything else falls back to a generated one. */
export const DISTRICTS_WITH_TERMINALS = new Set(Object.keys(RAW));
