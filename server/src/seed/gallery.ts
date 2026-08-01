/**
 * Works out which photo goes where.
 *
 * Operators pin three coach photos each in data.ts and tour packages pin one.
 * Anything else sitting in bus_image/ is spread across the operators
 * round-robin, so a picture dropped into that folder reaches the website on the
 * next seed run without anyone editing the seed data by hand.
 */
import { OPERATORS } from './data';
import { TOURS } from './tours';

/** Filenames a seed record names explicitly. */
export function pinnedImages(): Set<string> {
  const pinned = new Set<string>();

  for (const operator of OPERATORS) {
    pinned.add(operator.image);
    pinned.add(operator.nonAcImage);
    pinned.add(operator.sleeperImage);
    for (const extra of operator.gallery ?? []) pinned.add(extra);
  }

  for (const tour of TOURS) pinned.add(tour.image);

  return pinned;
}

/** Photos in bus_image/ that no operator or tour has claimed yet. */
export function unpinnedImages(filenames: string[]): string[] {
  const pinned = pinnedImages();
  return filenames.filter((name) => !pinned.has(name));
}

/**
 * Operator code -> the photos shown for that operator: its own pinned coach
 * shots first, then its share of the unpinned files. Deterministic, so
 * re-seeding never reshuffles a gallery.
 */
export function buildGalleries(filenames: string[]): Map<string, string[]> {
  const extras = unpinnedImages(filenames);
  const galleries = new Map<string, string[]>();

  OPERATORS.forEach((operator, index) => {
    const own = [
      operator.image,
      operator.sleeperImage,
      operator.nonAcImage,
      ...(operator.gallery ?? []),
    ];
    const share = extras.filter((_, i) => i % OPERATORS.length === index);
    galleries.set(operator.code, [...new Set([...own, ...share])]);
  });

  return galleries;
}

/**
 * Photos for one coach: the fleet-class shot first — the search card and
 * ticket use images[0] — followed by that operator's unpinned extras.
 */
export function coachImages(
  primary: string,
  operatorCode: string,
  galleries: Map<string, string[]>,
): string[] {
  const gallery = galleries.get(operatorCode) ?? [];
  return [...new Set([primary, ...gallery])].filter(Boolean);
}

/** Resolves filenames to uploaded URLs, dropping any that failed to upload. */
export function toUrls(filenames: string[], imageUrls: Record<string, string>): string[] {
  return filenames.map((name) => imageUrls[name]).filter((url): url is string => Boolean(url));
}
