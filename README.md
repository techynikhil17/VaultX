# VaultX

Zero-knowledge password manager and strength analyzer built with Next.js 14, Supabase, and the Web Crypto API.

Vault entries are encrypted on your device with **AES-256-GCM** using a key derived from your master password via **PBKDF2 (310,000 iterations, SHA-256)**. The master password and the derived key never leave the browser. The server only ever sees ciphertext.

## Features

- **Auth** — Supabase email/password signup, login, logout. Middleware-protected dashboard routes.
- **Strength analyzer** — entropy estimate, crack-time, pattern detection (common passwords, keyboard walks, dictionary words, repeats).
- **Generator** — length 8–128, customizable character sets, ambiguous-char filter, pronounceable mode, bulk options.
- **Vault** — CRUD with client-side AES-256-GCM encryption, per-entry IV, search, category filter, reveal toggle, copy with 30-second clipboard auto-clear, last-used and created-at timestamps.
- **HIBP breach check** — k-Anonymity (only first 5 chars of SHA-1 sent), single check + bulk health scan.
- **Health dashboard** — total / weak / reused / breached counts, vault health score (0–100), flagged-password list.
- **Activity log** — login, logout, vault CRUD, breach checks, health scans.
- **UI** — dark theme, sidebar navigation, responsive, toast notifications, loading skeletons. Keyboard shortcuts: `Ctrl+K` (search vault), `Ctrl+G` (regenerate password).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, paste and run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates the `vault_entries` and `activity_logs` tables and enables Row Level Security so users can only access their own rows.
3. Under **Authentication → Providers**, ensure email/password is enabled. Optionally disable email confirmation for local development.
4. Under **Authentication → Rate Limits**, ensure sensible limits on the auth endpoints (Supabase enforces these at the edge).

### 3. Configure environment

Copy the example env file and fill in your project's URL and anon key (Settings → API):

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and create your first vault entry.

## Architecture

```
app/
  (auth)/login, (auth)/signup       — public pages
  (dashboard)/                      — protected routes (middleware-gated + UnlockGate)
    dashboard/   — health overview + scan
    vault/       — encrypted CRUD list
    generator/   — password generator
    breach-check/— single-password HIBP check
    activity/    — event log
    profile/     — account info + lock
  page.tsx                          — landing
  layout.tsx                        — root + Toaster
lib/
  crypto.ts        — AES-256-GCM + PBKDF2 + verifier
  hibp.ts          — k-Anonymity breach lookup
  strength.ts      — entropy + pattern scoring
  generator.ts     — secure password generation
  schemas.ts       — Zod input schemas
  activity.ts      — log helpers
  vault-context.tsx— in-memory vault key
  supabase/        — browser, server, middleware clients
components/
  Sidebar.tsx, UnlockGate.tsx, CopyButton.tsx
  strength/StrengthMeter.tsx
  vault/VaultList.tsx, VaultEntryDialog.tsx
middleware.ts      — auth-aware redirect
supabase/migrations/0001_init.sql
```

### How encryption works

1. On signup, the user picks a master password (must be at least Fair strength).
2. On each session, `UnlockGate` asks for that master password and runs **PBKDF2-SHA256 (310k iters)** with a per-user random salt (stored in `localStorage`) to derive a 256-bit AES-GCM key. The key lives only in React state and is dropped on tab close or manual lock.
3. A **verifier** ciphertext is encrypted on first unlock and re-checked on every subsequent unlock to detect typos before the user tries to decrypt vault rows.
4. Each vault row stores `username_encrypted`, `password_encrypted`, `notes_encrypted`, and a fresh 96-bit `iv` per row. The same IV is reused across the row's three encrypted fields (still safe because each row's IV is unique). Site name, URL, and category are intentionally stored in cleartext for searchability.
5. Supabase RLS policies enforce that users can only `select / insert / update / delete` rows where `user_id = auth.uid()` — even if the anon key is exposed, no cross-user access is possible.

### Threat model notes

- The server (Supabase) is treated as untrusted for vault contents.
- The client device must be trusted — a compromised browser extension or local malware can read the in-memory key.
- The salt lives in `localStorage`; rotating browsers requires re-entering the master password (the server can't help).
- HIBP requests use k-Anonymity, so HIBP only ever sees the first 5 hex chars of `SHA1(password)`.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — lint

## License

MIT
