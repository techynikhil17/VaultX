import type { StrengthResult } from "./strength";

export function getSuggestions(pw: string, result: StrengthResult): string[] {
  if (result.score >= 85) return [];
  const tips: string[] = [];
  const { breakdown, score, warnings } = result;

  if (breakdown.length < 12) {
    const needed = 12 - breakdown.length;
    const entropyGain = Math.round(needed * Math.log2(62));
    tips.push(`Add ${needed} more character${needed > 1 ? "s" : ""} → +${entropyGain} entropy bits`);
  }
  if (!breakdown.upper) tips.push("Mix in some uppercase letters (A–Z)");
  if (!breakdown.lower) tips.push("Add lowercase letters (a–z)");
  if (!breakdown.number) tips.push("Include at least one number (0–9)");
  if (!breakdown.symbol) tips.push("Add a symbol like !@#$%^ to massively boost entropy");
  if (warnings.some(w => w.includes("keyboard"))) tips.push("Avoid keyboard patterns like qwerty or asdf");
  if (warnings.some(w => w.includes("repeated"))) tips.push("Avoid repeating characters (aaaa, 1111)");
  if (warnings.some(w => w.includes("dictionary"))) tips.push("Don't use plain dictionary words — substitute letters or use a passphrase");
  if (score < 45 && breakdown.length >= 12) tips.push("Try a random passphrase: 4 unrelated words + a number");

  return tips.slice(0, 3);
}
