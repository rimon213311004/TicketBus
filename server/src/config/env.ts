import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const defaultClientUrl = process.env.NODE_ENV === 'production'
  ? 'https://ticket-bus-client.vercel.app'
  : 'http://localhost:5173';
const configuredClientUrl = process.env.CLIENT_URL ?? defaultClientUrl;
const allowedOrigins = [...configuredClientUrl.split(','), defaultClientUrl]
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)
  .filter((origin, index, origins) => origins.indexOf(origin) === index);

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientUrl: configuredClientUrl,
  allowedOrigins,
  mongoUri: required('MONGO_URI'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },
  payment: {
    receiverNumber: process.env.PAYMENT_RECEIVER_NUMBER ?? '01875895858',
  },
  isProduction: process.env.NODE_ENV === 'production',
};
