import { sha1Hex } from "./crypto";

// HaveIBeenPwned k-Anonymity: send only first 5 chars of SHA-1.
export async function checkPasswordPwned(password: string): Promise<number> {
  if (!password) return 0;
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) throw new Error(`HIBP request failed: ${res.status}`);
  const text = await res.text();
  for (const line of text.split("\n")) {
    const [suf, count] = line.trim().split(":");
    if (suf === suffix) return parseInt(count, 10) || 0;
  }
  return 0;
}
