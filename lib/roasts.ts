import type { StrengthResult } from "./strength";

const COMMON_ROASTS = [
  "My 7-year-old cousin generates stronger passwords when she sits on the keyboard. Accidentally.",
  "Hackers don't even need to brute-force this. They'll just guess it while making coffee.",
  "This password has the same energy as leaving your house key under the welcome mat with a note that says 'key here'.",
  "Somewhere, a hacker just got a notification: 'Easy one incoming.'",
  "A goldfish with a random number generator could crack this in its 3-second memory span.",
  "This is less a password and more a polite suggestion that security might be nice.",
  "You've essentially put a bicycle lock on a bank vault. Stylish. Ineffective.",
  "I've seen better security on a diary with a tiny plastic key.",
  "This password couldn't protect a secret from a golden retriever, let alone a hacker.",
  "Congratulations — you've successfully secured nothing while feeling like you did something.",
];

const KEYBOARD_WALK_ROASTS = [
  "Ah yes, the 'drag my finger across the keyboard and call it a day' strategy. Bold.",
  "You literally just slid your finger sideways. That's not a password, that's a keyboard smear.",
  "qwerty/asdf/12345 detected. You basically just told hackers: 'I didn't try. Please come in.'",
  "Your finger went on a little walk across the keyboard. Unfortunately, so will hackers.",
];

const COMMON_PASSWORD_ROASTS = [
  "Congratulations — this password is so famous it has its own Wikipedia page. Under 'How to Get Hacked Instantly'.",
  "This exact string appears in every hacker's dictionary. You're not using a password, you're using a landmark.",
  "3.7 billion data breaches include this password. You're not locked out of hackers — hackers are locked into you.",
  "password/123456/admin detected. Incredible. A truly original choice. Like choosing 'John' as a disguise name.",
];

const REPEATING_ROASTS = [
  "Repeating the same character over and over. You clearly have commitment issues — with security.",
  "aaaa1111? That's not a password, that's a stutter.",
  "Repeating characters detected. Even Morse code has more variation than this.",
];

const TOO_SHORT_ROASTS = [
  "That password is shorter than my attention span. And I'm a language model with 200k context.",
  "5 characters? A toddler's name is longer and more secure.",
  "This is so short it barely qualifies as a word, let alone a password.",
  "Cuteness points for brevity. Zero points for security. Hackers will crack this during a yawn.",
];

const ONLY_NUMBERS_ROASTS = [
  "All numbers? Your PIN called. It wants its security back.",
  "Purely numeric passwords — the '1234' is strong with this one.",
  "Numbers only. Did you also lock your house by leaving the door slightly ajar?",
];

const DICTIONARY_ROASTS = [
  "A single dictionary word. You've handed hackers a welcome mat, a house key, and a warm beverage.",
  "Dictionary attack incoming in 3... 2... 1...",
  "This is a real word that exists in every language model and hacker wordlist since 1995. Brave choice.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRoast(pw: string, result: StrengthResult): string | null {
  if (result.score >= 45) return null;

  const lc = pw.toLowerCase();
  const w = result.warnings;

  if (w.some(x => x.includes("most common"))) return pick(COMMON_PASSWORD_ROASTS);
  if (w.some(x => x.includes("keyboard"))) return pick(KEYBOARD_WALK_ROASTS);
  if (w.some(x => x.includes("repeated"))) return pick(REPEATING_ROASTS);
  if (w.some(x => x.includes("Only digits"))) return pick(ONLY_NUMBERS_ROASTS);
  if (w.some(x => x.includes("dictionary"))) return pick(DICTIONARY_ROASTS);
  if (result.breakdown.length < 8) return pick(TOO_SHORT_ROASTS);
  return pick(COMMON_ROASTS);
}
