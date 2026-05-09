// RFC 6238 TOTP using Web Crypto HMAC-SHA1. No external dependencies.

function base32Decode(base32: string): Uint8Array<ArrayBuffer> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/\s/g, "").replace(/=+$/, "");
  const bits: number[] = [];
  for (const ch of cleaned) {
    const v = alphabet.indexOf(ch);
    if (v < 0) continue;
    for (let i = 4; i >= 0; i--) bits.push((v >> i) & 1);
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    bytes[i] = b;
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

function counterToBytes(counter: number): Uint8Array<ArrayBuffer> {
  const buf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = c & 0xff; c = Math.floor(c / 256); }
  return buf as Uint8Array<ArrayBuffer>;
}

export async function generateTOTP(base32Secret: string, digits = 6, period = 30): Promise<string> {
  const key = base32Decode(base32Secret);
  const counter = Math.floor(Date.now() / 1000 / period);
  const msg = counterToBytes(counter);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, msg));
  const offset = sig[19] & 0x0f;
  const code = ((sig[offset] & 0x7f) << 24 | sig[offset+1] << 16 | sig[offset+2] << 8 | sig[offset+3]) % Math.pow(10, digits);
  return code.toString().padStart(digits, "0");
}

export function totpSecondsRemaining(period = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}
