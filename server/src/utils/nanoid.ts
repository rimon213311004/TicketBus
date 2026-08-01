import crypto from 'crypto';

/** Minimal nanoid-style generator so we don't pull in another dependency. */
export function customAlphabet(alphabet: string, size: number) {
  return (): string => {
    const bytes = crypto.randomBytes(size);
    let out = '';
    for (let i = 0; i < size; i += 1) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  };
}
