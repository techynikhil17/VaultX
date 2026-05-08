# VaultX Upgrade — Design Spec
**Date:** 2026-05-08  
**Goal:** Transform VaultX from a functional prototype into a hackathon-winning premium product.

---

## 1. Design System — "Lumina"

**Palette**
- Background: `#07071a` (deep navy-black)
- Panel: `rgba(255,255,255,0.04)` frosted glass
- Border: `rgba(255,255,255,0.08)` (default), `rgba(99,102,241,0.5)` (active/hover)
- Accent: `#6366f1` (indigo), `#8b5cf6` (violet)
- Success: `#10b981`, Warning: `#f59e0b`, Danger: `#ef4444`
- Text: `#e0e0f5` (primary), `#6060a0` (muted)

**Background Treatment**
Every page gets an animated radial gradient mesh:
```css
background: radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.2) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.15) 0%, transparent 50%),
            #07071a;
```
Plus a subtle grid overlay at 28px pitch using `rgba(99,102,241,0.05)`.

**Glass Cards**
```css
background: rgba(255,255,255,0.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
```
Hover state adds `border-color: rgba(99,102,241,0.4)` and `box-shadow: 0 0 30px rgba(99,102,241,0.1)`.

**Motion**
- All transitions: `transition: all 0.2s ease`
- Strength bar: animated fill using CSS transitions
- Dashboard counters: count-up animation on mount (CSS `@keyframes`)
- Sidebar active pill: sliding highlight

**Typography**
- Headings: system-ui bold, gradient text clip on major headings
- Monospace: `ui-monospace` for passwords, scores, hashes
- Labels: `10px uppercase tracking-widest` for metadata

---

## 2. Upgraded Existing Features

### Password Strength Meter
- Live color-coded strength bar (animated transition)
- 5-segment pip indicators per character class
- Entropy + crack time displayed in styled chips
- Pattern warning badges (keyboard walk, common password, etc.)
- **Password Roast** — when score < 45, display a randomly selected savage-but-funny roast. See §7.

### Vault List
- Glass cards with per-category gradient accent color on left border
- Strength pip dots shown inline on each entry (5 dots, filled = strong char class)
- Password age chip: "90d old" with amber color if > 90 days
- Favorite/pin toggle (star icon) — stored via `is_favorite` column
- Category color system: Social=pink, Work=blue, Finance=green, Email=amber, etc.
- Smooth reveal animation on password show/hide

### Dashboard
- Animated count-up on all stat numbers
- SVG radial gauge for vault health score (0–100)
- Category donut breakdown (pure SVG, no lib)
- "Flagged" list with severity icons and direct edit links
- Password age distribution (how many are >30d, >90d, >1y)

### Sidebar
- Glowing active indicator (indigo dot + bg glow)
- Keyboard shortcut hints shown on hover (`⌘K`, `⌘G`)
- Lock/unlock state indicator at bottom
- Add TOTP and Notes to nav

---

## 3. New Features

### 3.1 Global Command Palette (`Cmd+K`)
**File:** `components/CommandPalette.tsx`

- Triggered by `Ctrl+K` / `Cmd+K` globally
- Fuzzy search across: vault entries (by site name, username, URL), all nav pages, quick actions
- Quick actions: "New entry", "Generate password", "Check breach", "Lock vault", "Run health scan"
- Keyboard navigation: ↑↓ to move, Enter to execute, Esc to close
- Grouped results: Pages / Vault Entries / Actions
- Vault entry results show category color dot, site name, username
- Mounted in `app/layout.tsx` so it's available everywhere

### 3.2 Password DNA Visualizer
**File:** `components/PasswordDNA.tsx`

- Grid of colored squares, one per character in the password
- Colors: lowercase=indigo, uppercase=violet, digit=amber, symbol=emerald, space=red
- Hover on each square shows tooltip: character type + position
- Updates in real-time as user types
- Shown in Generator page and VaultEntryDialog

### 3.3 TOTP / 2FA Manager
**Files:** `lib/totp.ts`, `app/(dashboard)/totp/page.tsx`

- Uses Web Crypto HMAC-SHA1 (RFC 6238) — no external lib
- TOTP entries stored in `vault_entries` with `category = "TOTP"`, seed in `password_encrypted`
- Live 6-digit code generation with 30s refresh
- Animated SVG countdown ring showing time remaining
- Manual seed entry + copy code button

### 3.4 Smart Password Suggestions
**File:** `lib/suggestions.ts`

- Analyzes current password deficiencies
- Returns 2–3 specific actionable strings, e.g.:
  - "Add 3 symbols (like `!@#`) to jump from Weak → Strong"
  - "Make it 4 characters longer to increase entropy by 26 bits"
  - "Avoid `password` — it appears in 3.7B known breaches"
- Shown below the strength meter in both the dialog and analyzer

### 3.5 Secure Notes
**File:** `app/(dashboard)/notes/page.tsx`

- Encrypted markdown notes using existing vault_entries (`category = "Note"`)
- Site_name = note title, notes_encrypted = content
- Simple textarea editor, full encryption/decryption via existing crypto.ts
- Listed as cards with title + excerpt (first 80 chars of decrypted content)

### 3.6 Vault Export (Encrypted Backup)
**File:** added to profile page

- Decrypts all entries client-side, re-encrypts the full JSON blob with a user-supplied export password via PBKDF2
- Downloads as `vaultx-backup-{date}.enc.json`
- No plaintext ever written to disk

### 3.7 Password Age Warnings
- `updated_at` already in schema
- Entries with `updated_at` > 90 days ago get an amber `90d` chip
- Entries > 1 year get a red `1y+` chip
- Dashboard shows "X passwords need rotation"

---

## 4. Password Roast System
**File:** `lib/roasts.ts`

Triggered when `analyzePassword(pw).score < 45`. Returns a randomly selected roast string from a curated list of ~20 roasts. Roasts are context-aware:

- **Common password detected** (e.g., "password123"): *"Congratulations, you've chosen a password so famous it has its own Wikipedia article. Hackers have this one memorized."*
- **Keyboard walk** (e.g., "qwerty"): *"Ah yes, the classic 'I dragged my finger across the keyboard and called it a day.' Bold strategy."*  
- **Repeating chars** (e.g., "aaaa1111"): *"Repeating the same character multiple times. You clearly have commitment issues — with security."*
- **Too short** (< 8 chars): *"That password is shorter than my attention span. And I'm a language model."*
- **Only numbers**: *"All numbers? Your PIN called. It wants its security back."*
- **Dictionary word**: *"A single dictionary word. You basically handed hackers a welcome mat and a house key."*
- **Generic weak**: rotates through 8+ savage one-liners like *"My 5-year-old cousin types stronger passwords when she sits on the keyboard."*

Roasts shown with a 🔥 icon in an amber callout below the strength warnings. Each page reload / re-type randomizes the roast.

---

## 5. Database Migration
**File:** `supabase/migrations/0002_enhancements.sql`

```sql
alter table public.vault_entries
  add column if not exists is_favorite boolean default false,
  add column if not exists expires_at date;
```

No other schema changes needed. TOTP and Notes reuse existing columns.

---

## 6. Updated Navigation (Sidebar)
| Route | Label | Icon |
|---|---|---|
| /dashboard | Dashboard | LayoutDashboard |
| /vault | Vault | KeyRound |
| /totp | Authenticator | ScanLine |
| /notes | Secure Notes | FileText |
| /generator | Generator | Wand2 |
| /breach-check | Breach Check | ShieldAlert |
| /activity | Activity | ScrollText |
| /profile | Profile | User |

---

## 7. Files to Create
- `lib/roasts.ts`
- `lib/totp.ts`
- `lib/suggestions.ts`
- `components/CommandPalette.tsx`
- `components/PasswordDNA.tsx`
- `app/(dashboard)/totp/page.tsx`
- `app/(dashboard)/notes/page.tsx`
- `supabase/migrations/0002_enhancements.sql`

## 8. Files to Heavily Modify
- `tailwind.config.ts` — full Lumina design tokens
- `app/globals.css` — glassmorphism, grid bg, animations, glow utilities
- `app/page.tsx` — premium landing page
- `app/(dashboard)/dashboard/page.tsx` — animated stats + SVG gauge
- `app/(dashboard)/generator/page.tsx` — add DNA visualizer
- `components/Sidebar.tsx` — Lumina redesign + new routes
- `components/strength/StrengthMeter.tsx` — roasts + suggestions + redesign
- `components/vault/VaultList.tsx` — glass cards + age chips + favorites
- `components/vault/VaultEntryDialog.tsx` — DNA in dialog
- `components/UnlockGate.tsx` — animated unlock screen with glow
- `app/(auth)/login/page.tsx` — Lumina auth pages
- `app/(auth)/signup/page.tsx` — Lumina auth pages
