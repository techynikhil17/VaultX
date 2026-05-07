// Password strength analyzer. Computes entropy, detects patterns, returns score.

const COMMON_PASSWORDS = new Set([
  "password", "123456", "123456789", "qwerty", "abc123", "password1", "12345678",
  "111111", "1234567", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon",
  "sunshine", "princess", "qwerty123", "1q2w3e4r", "passw0rd", "trustno1", "master",
  "shadow", "football", "baseball", "starwars",
]);

const KEYBOARD_ROWS = [
  "1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "!@#$%^&*()",
];

const DICTIONARY = [
  "love", "money", "hello", "secret", "summer", "winter", "spring", "autumn",
  "happy", "world", "friend", "family", "computer", "internet", "google", "apple",
];

export interface StrengthResult {
  score: number; // 0-100
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  entropyBits: number;
  crackTime: string;
  breakdown: {
    length: number;
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
  };
  warnings: string[];
}

export function analyzePassword(pw: string): StrengthResult {
  const length = pw.length;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const symbol = /[^A-Za-z0-9]/.test(pw);

  let charset = 0;
  if (lower) charset += 26;
  if (upper) charset += 26;
  if (number) charset += 10;
  if (symbol) charset += 33;

  const entropyBits = length > 0 && charset > 0 ? Math.log2(charset) * length : 0;

  const warnings: string[] = [];
  let penalty = 0;

  const lc = pw.toLowerCase();
  if (COMMON_PASSWORDS.has(lc)) {
    warnings.push("This is one of the most common passwords");
    penalty += 60;
  }
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - 4; i++) {
      const seg = row.slice(i, i + 4);
      if (lc.includes(seg)) {
        warnings.push(`Contains keyboard sequence "${seg}"`);
        penalty += 15;
        break;
      }
    }
  }
  if (/(.)\1{2,}/.test(pw)) {
    warnings.push("Contains repeated characters");
    penalty += 10;
  }
  for (const word of DICTIONARY) {
    if (lc.includes(word)) {
      warnings.push(`Contains dictionary word "${word}"`);
      penalty += 10;
      break;
    }
  }
  if (/^\d+$/.test(pw)) {
    warnings.push("Only digits");
    penalty += 20;
  }
  if (length < 8) {
    warnings.push("Too short — at least 12 characters recommended");
    penalty += 25;
  }

  let score = Math.min(100, Math.round(entropyBits * 1.4));
  score = Math.max(0, score - penalty);
  if (length === 0) score = 0;

  let label: StrengthResult["label"] = "Very Weak";
  if (score >= 85) label = "Very Strong";
  else if (score >= 65) label = "Strong";
  else if (score >= 45) label = "Fair";
  else if (score >= 25) label = "Weak";

  return {
    score,
    label,
    entropyBits: Math.round(entropyBits),
    crackTime: estimateCrackTime(entropyBits),
    breakdown: { length, upper, lower, number, symbol },
    warnings,
  };
}

function estimateCrackTime(bits: number): string {
  // Assume 1e10 guesses/sec (offline fast attack).
  const guesses = Math.pow(2, bits) / 2;
  const seconds = guesses / 1e10;
  if (seconds < 1) return "instant";
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < 31_536_000) return `${(seconds / 86400).toFixed(1)} days`;
  const years = seconds / 31_536_000;
  if (years < 1e3) return `${years.toFixed(1)} years`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
  return "centuries";
}
