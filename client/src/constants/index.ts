export const APP_NAME = 'TicketBus';

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  bank: 'Bank Transfer',
  cash: 'Cash at Counter',
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  bkash: '#E2136E',
  nagad: '#F6921E',
  rocket: '#8C3494',
  bank: '#2563EB',
  cash: '#22C55E',
};

export const BUS_TYPE_OPTIONS = ['Economy', 'Business', 'Executive', 'Sleeper', 'Double Decker'];
export const AC_TYPE_OPTIONS = ['AC', 'Non-AC'];

export const SORT_OPTIONS = [
  { value: 'departure', label: 'Departure time' },
  { value: 'fare_asc', label: 'Price: low to high' },
  { value: 'fare_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Operator rating' },
];

export const AMENITY_ICONS: Record<string, string> = {
  'Air Conditioning': 'snowflake',
  'Wi-Fi': 'wifi',
  'USB Charging': 'usb',
  'Mobile Charging': 'battery-charging',
  Blankets: 'bed',
  'Drinking Water': 'cup-soda',
  'GPS Tracking': 'map-pin',
  CCTV: 'video',
  'Reading Light': 'lamp',
  'Reclining Seats': 'armchair',
  'Emergency Exit': 'door-open',
};
