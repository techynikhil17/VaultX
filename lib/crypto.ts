// VaultX client-side crypto. AES-256-GCM with PBKDF2-derived key (310k iters, SHA-256).
// The vault key lives only in memory; the master password is never persisted or sent.

const PBKDF2_ITERATIONS = 310_000;
const SALT_STORAGE_KEY = "vaultx.salt";

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out as Uint8Array<ArrayBuffer>;
}

export function getOrCreateSalt(userId: string): Uint8Array {
  const key = `${SALT_STORAGE_KEY}.${userId}`;
  const existing = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (existing) return fromB64(existing);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  if (typeof window !== "undefined") localStorage.setItem(key, toB64(salt));
  return salt;
}

export async function deriveVaultKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as Uint8Array<ArrayBuffer>,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedField {
  ciphertext: string; // base64
  iv: string; // base64
}

export async function encryptString(key: CryptoKey, plaintext: string): Promise<EncryptedField> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc);
  return { ciphertext: toB64(ct), iv: toB64(iv) };
}

export async function decryptString(key: CryptoKey, ciphertextB64: string, ivB64: string): Promise<string> {
  const iv = fromB64(ivB64);
  const ct = fromB64(ciphertextB64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

// Verifier — encrypt a known token to test that the master password is correct on later unlocks.
const VERIFIER_PLAINTEXT = "vaultx::verifier::v1";
export async function makeVerifier(key: CryptoKey): Promise<EncryptedField> {
  return encryptString(key, VERIFIER_PLAINTEXT);
}
export async function checkVerifier(key: CryptoKey, v: EncryptedField): Promise<boolean> {
  try {
    const pt = await decryptString(key, v.ciphertext, v.iv);
    return pt === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

export function storeVerifier(userId: string, v: EncryptedField) {
  localStorage.setItem(`vaultx.verifier.${userId}`, JSON.stringify(v));
}
export function loadVerifier(userId: string): EncryptedField | null {
  const raw = localStorage.getItem(`vaultx.verifier.${userId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function sha1Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  const bytes = new Uint8Array(buf);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
