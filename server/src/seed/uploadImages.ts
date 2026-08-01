import fs from 'fs';
import path from 'path';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../utils/logger';

const IMAGE_DIR = path.resolve(__dirname, '../../../bus_image');
const CACHE_FILE = path.resolve(__dirname, '../../seed-cache.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

type UploadCache = Record<string, string>;

function readCache(): UploadCache {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) as UploadCache;
  } catch {
    return {};
  }
}

function writeCache(cache: UploadCache): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/** Every image sitting in bus_image/, so newly dropped-in photos get picked up. */
export function listLocalImages(): string[] {
  if (!fs.existsSync(IMAGE_DIR)) return [];
  return fs
    .readdirSync(IMAGE_DIR)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();
}

/**
 * Uploads every bus photo to Cloudinary and returns filename -> secure URL.
 * Results are cached on disk so re-running the seed doesn't re-upload.
 */
export async function uploadBusImages(filenames?: string[]): Promise<UploadCache> {
  const cache = readCache();
  const targets = filenames ?? listLocalImages();
  let uploaded = 0;

  for (const filename of targets) {
    if (cache[filename]) continue;

    const filePath = path.join(IMAGE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      logger.warn(`Image not found, skipping: ${filename}`);
      continue;
    }

    const publicId = path.parse(filename).name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ticketbus/operators',
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    });

    cache[filename] = result.secure_url;
    uploaded += 1;
    logger.info(`Uploaded ${filename}`);
  }

  if (uploaded > 0) writeCache(cache);
  logger.info(`Images ready: ${Object.keys(cache).length} total, ${uploaded} newly uploaded`);
  return cache;
}
