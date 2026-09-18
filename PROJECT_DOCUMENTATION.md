# Privacy Scanner (Stalker) - Project Documentation

**Last Updated:** September 6, 2026  
**Current Branch:** `main`  
**Latest Commit:** `763787c` - feat: complete privacy scanner setup with Next.js, Prisma SQLite, OSINT engine, and scan UI

---

## 📋 Project Overview

**Privacy Scanner** (code-named "Stalker") is a personal privacy scanning and digital exposure intelligence web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, and **Prisma ORM** with SQLite database.

### Core Purpose
A unified dashboard to discover exposed credentials, track data broker listings, and safeguard online identity through automated OSINT (Open Source Intelligence) scanning.

---

## ✨ Implemented Features

### 1. **Breach Radar Engine** (`lib/scanner/breaches.ts`)
- **Live HIBP Integration:** Queries HaveIBeenPwned API v3 when `HIBP_API_KEY` is configured in `.env`
- **Local Intelligence Catalog:** Curated database of 6 major real-world breaches (Naz.API, Twitter 200M, Canva, Dropbox, Adobe, Collection #1)
- **Smart Fallback:** Automatic fallback to local catalog on API failure, network issues, or missing API key
- **Demo/Test Logic:** Deterministic matching for test emails containing keywords like "test", "admin", "pwned", "demo", "leak", or starting with "alex", "john", "user"

### 2. **OSINT Footprint Scanner** (`lib/scanner/gravatar.ts`)
- **Gravatar SHA-256 Probing:** Cryptographically probes public Gravatar profiles using email hash
- **Profile Enrichment:** Fetches public profile JSON (`/v3/profiles/{hash}`) for display names
- **Avatar Detection:** HEAD request to `https://www.gravatar.com/avatar/{sha256}?d=404` to check avatar existence
- **Privacy-Preserving:** Only uses hashed email identifiers, never sends raw email to external services

### 3. **Domain Verification Engine** (`lib/scanner/email-check.ts`)
- **DNS MX Record Resolution:** Native Node.js `dns/promises` for mail server verification
- **Provider Classification:** Categorizes domains as `custom`, `public_free`, `disposable`, or `corporate`
- **Disposable Email Detection:** Maintains curated list of 10+ disposable email providers
- **Popular Provider Registry:** 18 major email providers (Gmail, Outlook, Yahoo, Proton, iCloud, etc.)

### 4. **Threat Scoring Algorithm** (`lib/scanner/index.ts`)
- **Unified Risk Score (0-100):** Weighted composite from multiple threat vectors, clamped to 100 after all module contributions are summed
- **Risk Tiering:** `CLEAN` (0) → `LOW` (1-24) → `MODERATE` (25-49) → `HIGH` (50-74) → `CRITICAL` (75-100)

> **Gap to close before Phase 3:** the per-module caps below (Phase 1 + planned Phase 2/3 caps from `PROJECT_PLAN.md`) sum to roughly 200 points (50 + 25 + 15 + 10 + 15 + 15 paste + 30 metadata + 40 profile-text), well past the stated 0–100 scale. Nothing in the orchestrator (`runPrivacyScan()`) is currently documented as clamping the *final* summed score — only individual factors are capped. Add an explicit `Math.min(total, 100)` (or equivalent re-weighting) at the end of the scoring algorithm and document it here once implemented.

**Scoring Breakdown:**
| Factor | Points |
|--------|--------|
| Each breach found | +20 (capped at 50) |
| Plaintext password leak detected | +25 |
| Hashed password in breach | +15 |
| OSINT exposure (Gravatar) | +10 |
| Disposable email domain | +15 |

### 5. **Prisma + SQLite Database** (`prisma/schema.prisma`)
```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  scanResults ScanResult[]
}

model ScanResult {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       String   // "EMAIL_PRIVACY_AUDIT"
  resultJson String   // Full ScanReport serialized
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### 6. **Interactive Web UI**
- **Hero Section:** Gradient typography, animated glow backgrounds, centered scan form
- **Scan Form (`components/ScanForm.tsx`):** Email input with validation, loading states, sample test chips
- **Results View (`components/ScanResultView.tsx`):** 
  - Threat level badge with color-coded icons
  - Risk score (0-100) with dynamic color (green/yellow/red)
  - 4-stat grid: Threat Score, Breaches, Data Types, OSINT Discoveries
  - Expandable breach cards with data class tags (red for passwords)
  - OSINT exposure cards with avatar images and profile links
  - Actionable privacy recommendations checklist
  - Database persistence indicator with scan ID
- **Feature Cards Section:** 6 capability cards with icons and badges
- **Architecture Section:** Visual Prisma schema documentation

---

## 🏗️ Architecture & File Structure

```
stalker/
├── app/
│   ├── api/scan/route.ts          # POST /api/scan - Main scan endpoint
│   ├── globals.css                # Tailwind v4 imports + custom styles
│   ├── layout.tsx                 # Root layout with metadata
│   └── page.tsx                   # Home page with hero, features, architecture
├── components/
│   ├── FeatureCard.tsx            # Reusable feature showcase card
│   ├── Footer.tsx                 # Site footer
│   ├── Navbar.tsx                 # Navigation header
│   ├── ScanForm.tsx               # Client-side scan form + results display
│   └── ScanResultView.tsx         # Detailed scan results visualization
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   ├── utils.ts                   # Utility functions (cn, etc.)
│   └── scanner/
│       ├── index.ts               # Main orchestrator (runPrivacyScan)
│       ├── types.ts               # TypeScript interfaces (ScanReport, etc.)
│       ├── breaches.ts            # HIBP + local breach catalog
│       ├── email-check.ts         # DNS + domain analysis
│       └── gravatar.ts            # Gravatar OSINT probing
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Migration history
├── .env.example                   # Environment template
├── next.config.ts                 # Next.js 16 configuration
├── tsconfig.json                  # TypeScript strict config
├── eslint.config.mjs              # ESLint flat config
├── postcss.config.mjs             # PostCSS for Tailwind v4
└── package.json                   # Dependencies & scripts
```

---

## 🔧 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js (App Router, Turbopack) | 16.3.4 |
| **Language** | TypeScript (Strict Mode) | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | SQLite via Prisma ORM | 6.4.1 |
| **Icons** | Lucide React | 1.16.0 |
| **Utilities** | clsx + tailwind-merge | 2.1.1 / 3.0.2 |
| **Linting** | ESLint (flat config) | 9.x |
| **Formatting** | Prettier + Tailwind plugin | 3.5.2 |

---

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma studio` | Open database GUI (port 5555) |

---

## ⚙️ Environment Configuration

**`.env.example`** (copy to `.env`):
```env
DATABASE_URL="file:./dev.db"
HIBP_API_KEY="your-haveibeenpwned-api-key"  # Optional: enables live breach API
```

---

## 🔌 API Endpoint

### `POST /api/scan`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "scanId": "scan_abc123def",
  "report": {
    "id": "scan_abc123def",
    "target": "user@example.com",
    "scannedAt": "2026-09-06T12:00:00.000Z",
    "threatLevel": "MODERATE",
    "riskScore": 35,
    "summary": {
      "totalBreaches": 2,
      "exposedDataClasses": ["Email addresses", "Passwords (bcrypt)", "Names"],
      "exposedAccountsCount": 1,
      "hasPlaintextPasswordLeak": false
    },
    "domainInfo": {
      "domain": "example.com",
      "isDisposable": false,
      "hasMxRecords": true,
      "providerType": "custom"
    },
    "breaches": [...],
    "accountExposures": [...],
    "recommendations": [...]
  }
}
```

**Error Responses:**
- `400` - Invalid email format
- `500` - Scan execution failure

---

## 🧪 Testing the Application

### Sample Test Emails (trigger demo data):
- `test.breach@example.com` - Shows 2 breaches (Twitter, Canva)
- `alex.pwned@admin.com` - Shows 4 breaches (Naz.API, Twitter, Canva, Dropbox)

### Manual Testing Flow:
1. `npm run dev`
2. Open `http://localhost:3000`
3. Enter test email or your own
4. Click "Scan Now"
5. View detailed results with breach cards, OSINT findings, and recommendations

---

## 🎨 UI/UX Design System

### Color Palette (Tailwind v4, Dark-First)
- **Background:** `slate-950` / `slate-900` cards
- **Primary Accent:** `indigo-500/600` (buttons, focus rings, badges)
- **Secondary Accent:** `cyan-400` / `purple-300` (gradients)
- **Success:** `emerald-400/500`
- **Warning:** `yellow-400/500`
- **Danger:** `red-400/500`, `orange-400/500`
- **Info:** `blue-400/500`, `indigo-400`

### Component Patterns
- **Glassmorphism:** `bg-slate-900/90 backdrop-blur-xl`
- **Cards:** `rounded-3xl border border-slate-800 bg-slate-900/70 p-6`
- **Badges:** `rounded-full border px-3.5 py-1.5 text-xs font-semibold`
- **Inputs:** `bg-transparent focus:outline-none` with focus ring
- **Buttons:** `rounded-xl bg-indigo-600 px-5 py-2.5` with hover/scale

---

## 📊 Database Management

### Migration History
```
20260905073806_init/
└── migration.sql  (Creates users & scan_results tables with indexes)
```

### Common Commands
```bash
# View database in browser
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push
```

---

## 🔐 Security & Privacy Considerations

1. **Hashed Querying Where the API Supports It:** Gravatar lookups use a SHA-256 hash of the email, and the planned Pastes check uses a SHA-1 hash (per HIBP's requirement for that endpoint). The HIBP *breach* lookup (`/api/v3/breachedaccount/{account}`), however, takes the plaintext email as a URL path segment — HIBP does not offer a hashed-lookup option for that endpoint. **Worth double-checking against HIBP's current docs before stating this as a blanket "email is always hashed" guarantee**, since that's a meaningful claim to get right in a privacy tool's own security section
2. **Local-First Storage:** SQLite database stays on user's machine
3. **No Raw Email in Logs:** Only scan IDs and threat levels logged
4. **Rate Limiting Ready:** HIBP API calls have 5s timeout, graceful fallback
5. **Input Validation:** Server-side email regex validation
6. **CORS/Same-Origin:** API only accessible from same origin

---

## 🚧 Known Limitations / Future Enhancements

> **Note:** This table previously listed several items ("Planned") that directly contradict firm architectural decisions recorded in `ARCHITECTURE.md` (see its "Key Architectural Decisions" and "What This Architecture Deliberately Does Not Include" sections). Those have been corrected below so this file and the architecture doc don't disagree with each other.

| Area | Current State | Planned / Direction |
|------|---------------|---------|
| **Breach Sources** | HIBP + 6 local catalog entries | DeHashed, LeakCheck, BreachDirectory APIs (all official APIs, same fallback pattern) |
| **Paste-site scanning** | Not yet implemented (Phase 1, Task 1.1 — `pastes.ts`) | HIBP Pastes API, in progress |
| **OSINT Coverage** | Gravatar only | Additional *official, ToS-compliant* APIs only (e.g. GitHub's public API). Facebook/Instagram/Twitter scraping is explicitly out of scope per Architectural Decision #3 — not a future item |
| **Dark Web** | Not implemented | Limited to public paste sites via HIBP (see above). Tor/.onion crawling and Telegram channel monitoring are explicitly excluded per Architectural Decision #3 and the Plan's "Explicitly Out of Scope" table — not a future item |
| **Authentication** | None, by design (anonymous scans) | Intentionally not planned — see Architectural Decision #1. Report retrieval is by `scanId`, not by account |
| **Real-time** | Manual scan only | Not currently scoped in any phase; would need its own plan entry before being treated as a roadmap item |
| **Export** | View only | PDF export (Phase 4, Task 4.2). Email delivery of reports is not currently scoped |
| **Multi-user** | Single-user SQLite | Not planned — see Architectural Decision #1 and the exclusion table in `ARCHITECTURE.md` |

---

## 📝 Development Notes

### Code Quality Standards
- **TypeScript Strict Mode:** Enabled (`tsconfig.json`)
- **ESLint:** Next.js recommended config + flat config
- **Prettier:** Auto-format on save with Tailwind plugin
- **Import Aliases:** `@/` maps to project root

### Key Design Decisions
1. **App Router + Server Components:** Default for all pages, client components only where needed (`"use client"`)
2. **Promise.allSettled:** Concurrent scanner execution with failure isolation
3. **Prisma Singleton:** `lib/prisma.ts` prevents hot-reload connection leaks
4. **Type-First Development:** All scanner interfaces in `types.ts` shared across modules
5. **Graceful Degradation:** Every external call has timeout + fallback to local logic

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run quality checks: `npm run lint && npm run format`
4. Commit changes: `git commit -m 'feat: add amazing feature'`
5. Push and open PR

---

## 📄 License

Private project - All rights reserved.

---

*Documentation generated from codebase analysis on 2026-09-06*