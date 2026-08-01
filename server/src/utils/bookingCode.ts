import { customAlphabet } from './nanoid';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generate = customAlphabet(alphabet, 8);

/** Human-readable code printed on tickets, e.g. TB-7K3M9QXA. */
export function generateBookingCode(): string {
  return `TB-${generate()}`;
}
