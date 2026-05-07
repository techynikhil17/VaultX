// Password generator using crypto.getRandomValues.

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const SYM = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIG = new Set("Il1O0o".split(""));

export interface GenOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  pronounceable?: boolean;
}

function randInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export function generatePassword(opts: GenOptions): string {
  if (opts.pronounceable) return generatePronounceable(opts.length);
  let charset = "";
  if (opts.lower) charset += LOWER;
  if (opts.upper) charset += UPPER;
  if (opts.numbers) charset += NUM;
  if (opts.symbols) charset += SYM;
  if (opts.excludeAmbiguous) charset = charset.split("").filter((c) => !AMBIG.has(c)).join("");
  if (!charset) return "";
  let out = "";
  for (let i = 0; i < opts.length; i++) out += charset[randInt(charset.length)];
  return out;
}

const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";

function generatePronounceable(length: number): string {
  let out = "";
  let useVowel = randInt(2) === 0;
  while (out.length < length) {
    const pool = useVowel ? VOWELS : CONSONANTS;
    let ch = pool[randInt(pool.length)];
    if (randInt(5) === 0) ch = ch.toUpperCase();
    out += ch;
    useVowel = !useVowel;
  }
  // Sprinkle a number at the end for uniqueness.
  if (length > 4) out = out.slice(0, length - 2) + String(randInt(90) + 10);
  return out.slice(0, length);
}

export function generateMultiple(opts: GenOptions, count: number): string[] {
  return Array.from({ length: count }, () => generatePassword(opts));
}
