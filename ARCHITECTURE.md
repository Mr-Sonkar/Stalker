# Privacy Scanner — System Architecture

**Last Updated:** September 6, 2026
**Status:** Living document — update as new scanner modules are added

---

## 🛠️ Technology Stack Specification

### Core Framework & Runtime
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.3.4 | Full-stack React framework with server components |
| Language | TypeScript | 5.x | Type-safe development with strict mode |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with dark-first design system |
| Database ORM | Prisma | 6.4.1 | Type-safe database access with SQLite |
| Database | SQLite | 3.x | Local-first embedded database (dev.db) |
| Icons | Lucide React | 1.16.0 | Consistent icon system |
| Utilities | clsx + tailwind-merge | 2.1.1 / 3.0.2 | Conditional className composition |

### Development Tooling
| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.x (flat config) | Linting with Next.js recommended rules |
| Prettier | 3.5.2 | Code formatting with Tailwind plugin |
| TypeScript | 5.x | Strict type checking |
| Prisma CLI | 6.4.1 | Database migrations & client generation |

### Scanner Dependencies
| Package | Purpose | Runtime |
|---------|---------|---------|
| @hapi/boom | HTTP error handling | Server |
| exifr | Image EXIF metadata extraction | Server |
| pdf-lib | PDF metadata parsing | Server |
| mammoth | DOCX metadata extraction | Server |
| tesseract.js | OCR for screenshots | Server |
| zxcvbn | Password strength estimation | Client |
| @react-pdf/renderer | PDF report generation | Server |

### External APIs
| API | Purpose | Auth | Fallback |
|-----|---------|------|----------|
| HaveIBeenPwned v3 | Breach & paste data | API Key (optional) | Local catalog |
| Gravatar | Profile/avatar lookup | None (public) | Graceful degradation |
| DNS (Node built-in) | MX record verification | None | Returns hasMxRecords: false |

---

## 📐 Architectural Pattern

**Pattern name:** Modular Scanner Pipeline (fan-out / fan-in orchestration)

**Core idea:** One orchestrator function triggers multiple independent scanner modules in parallel. Each module has a single responsibility, fails independently, and returns a typed result. The orchestrator merges all results into one unified report and computes a single score from it.

This pattern was chosen over alternatives (e.g., a monolithic scan function, or a microservices split) because:
- It keeps the project inside one deployable Next.js app — no separate services to run, deploy, or coordinate for a capstone timeline
- Adding a feature never means restructuring existing code — it means adding one new file
- One scanner failing (e.g., an external API timing out) never breaks the whole scan, which matters a lot for a live demo in front of mentors

---

## 🗺️ System Diagram

```
┌───────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                               │
│  ┌───────────────┐   ┌──────────────────┐   ┌─────────────┐ │
│  │   ScanForm     │   │  ScanResultView   │   │ Fingerprint │ │
│  │  (email/file   │   │  (renders report) │   │    Demo     │ │
│  │    input)      │   │                    │   │  (client-   │ │
│  └───────┬────────┘   └────────▲───────────┘   │  only, no   │ │
│          │                     │                │  API call) │ │
│          │                     │                └─────────────┘ │
│          │              ┌──────┴───────┐                        │
│          │              │ zxcvbn        │ ← password strength   │
│          │              │ (client-side) │    checked instantly, │
│          │              └───────────────┘    never sent to API  │
└──────────┼─────────────────────▲─────────────────────────────────┘
           │ POST /api/scan       │ JSON response
┌──────────▼─────────────────────┴─────────────────────────────────┐
│                      SERVER (Next.js API Routes)                   │
│                                                                     │
│   app/api/scan/route.ts                                            │
│         │                                                          │
│         ▼                                                          │
│   runPrivacyScan()  ── lib/scanner/index.ts (orchestrator)         │
│         │                                                          │
│         │  Promise.allSettled([ ... ])                             │
│         │                                                          │
│  ┌──────┼───────────┬─────────────┬─────────────┬─────────────┐   │
│  ▼      ▼           ▼             ▼             ▼             ▼   │
│ breaches email-check gravatar    pastes       metadata    profile- │
│  .ts      .ts         .ts        .ts           .ts        text.ts │
│  │         │           │          │             │             │   │
│  │         │           │          │             │             │   │
│  ▼         ▼           ▼          ▼             ▼             ▼   │
│ HIBP     DNS MX     Gravatar    HIBP        exifr /      tesseract │
│  API    lookup       API       Pastes      pdf-lib /       .js +   │
│                                   API       mammoth      regex     │
│                                                                     │
│         │  (all results merged)                                    │
│         ▼                                                           │
│   Threat Scoring Algorithm  ── computes ScanReport.riskScore        │
│         │                                                            │
│         ▼                                                            │
│   Prisma ORM  ──►  SQLite (dev.db)                                   │
│         │                                                            │
│         ▼                                                            │
│   Response returned to client                                        │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  app/api/export/route.ts  →  @react-pdf/renderer  →  PDF download   │
│  (reads a saved ScanReport by scanId, renders to PDF, no rescan)     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Responsibilities

### Frontend Layer

| Component | Responsibility | Runs |
|---|---|---|
| `ScanForm.tsx` | Collects email input + optional file upload; client-side validation; loading state | Client |
| `ScanResultView.tsx` | Renders the full `ScanReport` — score, breach cards, OSINT cards, metadata findings, recommendations | Client |
| `FeatureCard.tsx` | Static capability showcase on homepage | Client (Server Component where possible) |
| **Password strength widget** | Runs `zxcvbn` on keystroke, shows live strength meter | Client-only, no API call |
| **Browser fingerprint demo** | Reads `navigator`, `screen`, `Intl` APIs, displays what a website could learn passively | Client-only, no API call, not part of `ScanReport` |

### API Layer

| Route | Responsibility |
|---|---|
| `app/api/scan/route.ts` | Accepts email (+ optional file), invokes `runPrivacyScan()`, persists result, returns report |
| `app/api/export/route.ts` | Accepts a `scanId`, fetches saved report from DB, renders PDF, returns file |

### Scanner Modules (`lib/scanner/`)

Each module follows the same contract: accept typed input, return a typed result object, never throw uncaught (always resolve, even on internal failure, so `Promise.allSettled` behaves predictably).

| Module | Data source | Failure behavior |
|---|---|---|
| `breaches.ts` | HIBP Breach API + local catalog | Falls back to local catalog on API failure |
| `email-check.ts` | Node `dns/promises` (MX lookup) | Returns `hasMxRecords: false` on lookup failure, doesn't throw |
| `gravatar.ts` | Gravatar public API (SHA-256 hash) | Returns `found: false` if hash lookup fails |
| `pastes.ts` | HIBP Pastes API | Returns `dataUnavailable: true` — never fabricates a fallback (paste data is time-sensitive) |
| `metadata.ts` *(planned)* | `exifr`, `pdf-lib`, `mammoth` — reads uploaded file | Returns empty findings if file type unsupported |
| `profile-text.ts` *(planned)* | `tesseract.js` OCR + regex | Returns empty findings if OCR confidence too low |

### Orchestration & Scoring

| Layer | Responsibility |
|---|---|
| `lib/scanner/index.ts` — `runPrivacyScan()` | Fans out to all scanner modules via `Promise.allSettled`, merges results into one `ScanReport` |
| Threat Scoring Algorithm (inside `index.ts`) | Weighted point system → 0–100 risk score → tier (`CLEAN`/`LOW`/`MODERATE`/`HIGH`/`CRITICAL`) |
| `lib/scanner/types.ts` | Single source of truth for `ScanReport` and all sub-interfaces — every module's output must conform to a type defined here |

### Persistence Layer

| Component | Responsibility |
|---|---|
| `prisma/schema.prisma` | Defines `User` and `ScanResult` models |
| `lib/prisma.ts` | Singleton Prisma client (prevents connection leaks on hot reload) |
| SQLite (`dev.db`) | Local-first storage — no external database dependency |

---

## 🧱 Detailed Component Architecture

### Frontend Layer (app/, components/)

```
app/
├── api/
│   ├── scan/route.ts          # POST /api/scan - Main orchestration endpoint
│   └── export/route.ts        # GET /api/export/:scanId - PDF report generation
├── globals.css                # Tailwind v4 imports + design tokens
├── layout.tsx                 # Root layout, metadata, font loading
└── page.tsx                   # Landing page with hero, features, architecture

components/
├── ScanForm.tsx               # Email input + file upload, validation, loading
├── ScanResultView.tsx         # Full report rendering (score, breaches, OSINT, metadata)
├── FeatureCard.tsx            # Capability showcase cards
├── Navbar.tsx                 # Navigation header
├── Footer.tsx                 # Site footer
├── PasswordStrength.tsx       # Client-only zxcvbn widget (planned)
├── BrowserFingerprint.tsx     # Client-only fingerprint demo (planned)
├── DataBrokerGuide.tsx        # Static opt-out links page (planned)
└── MetadataStripper.tsx       # File cleaning utility (planned bonus)
```

### Scanner Modules (lib/scanner/)

```
lib/scanner/
├── index.ts                   # Orchestrator: runPrivacyScan() + scoring
├── types.ts                   # Single source of truth: ScanReport & sub-types
├── breaches.ts                # HIBP Breach API + local catalog (6 breaches)
├── email-check.ts             # DNS MX lookup + provider classification
├── gravatar.ts                # Gravatar SHA-256 profile/avatar probing
├── pastes.ts                  # HIBP Pastes API (planned)
├── metadata.ts                # File metadata extraction (planned)
│   ├── image-metadata.ts      # exifr for JPEG/PNG/HEIC
│   ├── pdf-metadata.ts        # pdf-lib for PDF documents
│   └── docx-metadata.ts       # mammoth for Word documents
└── profile-text.ts            # OCR + PII regex (planned)
    ├── ocr.ts                 # tesseract.js wrapper
    └── pii-detection.ts       # Regex patterns for phone, address, DOB, email
```

### Data Layer (prisma/, lib/)

```
prisma/
├── schema.prisma              # User + ScanResult models
└── migrations/                # Migration history

lib/
├── prisma.ts                  # Prisma singleton (prevents hot-reload leaks)
└── utils.ts                   # Shared utilities (cn, formatting, etc.)
```

### Type Contracts (lib/scanner/types.ts)

```typescript
// Core report interface - single source of truth
interface ScanReport {
  id: string;
  target: string;
  scannedAt: string;
  threatLevel: 'CLEAN' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  summary: ScanSummary;
  domainInfo: DomainInfo;
  breaches: BreachFinding[];
  accountExposures: OSINTFinding[];
  metadataFindings?: MetadataFinding[];      // Phase 2
  profileTextFindings?: ProfileTextFinding[]; // Phase 3
  recommendations: Recommendation[];
}

// Sub-interfaces defined per module
interface BreachFinding { /* ... */ }
interface OSINTFinding { /* ... */ }
interface MetadataFinding { /* ... */ }
interface ProfileTextFinding { /* ... */ }
```

## 🔑 Key Architectural Decisions

### 1. Anonymous by default — no authentication
**Decision:** Do not implement login/auth for the capstone.
**Reasoning:** Matches the project's privacy-first pitch ("we don't even ask who you are"), removes a large complexity category (sessions, magic links, NextAuth config) that doesn't serve the core thesis. Report retrieval is handled via `scanId`, not user accounts.

### 2. Server-side vs. client-side split
**Decision:** External API calls, file parsing, and OCR run server-side. Password strength and browser fingerprinting run entirely client-side.
**Reasoning:** Server-side work needs API keys, file system access, or CPU-heavy processing (OCR) that shouldn't run in-browser. Client-side features have no such dependency, so keeping them client-only avoids unnecessary API round-trips and server load.

### 3. No live dark web / social media scraping
**Decision:** All data sources are either official APIs (HIBP, Gravatar) or user-submitted content (uploaded files, pasted text/screenshots) — never automated scraping of platforms that prohibit it (Instagram, Facebook) or crawling of restricted networks (Tor/.onion).
**Reasoning:** Documented in detail in `SURFACE_PASTE_LEAK_SCAN_DOCUMENTATION.md`. This is a firm architectural boundary, not just a feature-level note — no module in `lib/scanner/` should ever be built to bypass a platform's access controls.

### 4. Fault-isolated parallel scanning
**Decision:** `Promise.allSettled`, not `Promise.all`, for the scanner fan-out.
**Reasoning:** One failing external API (e.g., HIBP rate limit) must never prevent the rest of the report from rendering. Critical for demo reliability.

### 5. One shared type contract (`types.ts`)
**Decision:** Every scanner module's output is a defined sub-type of `ScanReport`, declared centrally.
**Reasoning:** Keeps the orchestrator, scoring algorithm, and UI all working off one schema. Adding a scanner module means adding one interface + one array field — nothing else needs to change shape.

---

## 📦 Deployment Shape

Single Next.js application — no separate backend service.

```
Vercel / Node host
   └── Next.js app (frontend + API routes together)
          └── SQLite file (dev.db) — local-first, no external DB server needed
```

For a capstone demo, this is intentionally simple: one app, one process, one local database file. No Docker, no separate services, no infra to explain or debug live in front of mentors.

---

## 🚫 What This Architecture Deliberately Does Not Include

| Excluded | Reason |
|---|---|
| Microservices / separate backend | Unnecessary complexity for project scope; one Next.js app is sufficient |
| Live Tor/.onion crawling | Legal and safety risk — see design decision #3 |
| Social media scraping (Instagram/Facebook) | ToS violation risk — replaced with self-report (screenshot/text) analysis |
| User authentication | Not needed for the project's thesis; adds complexity without adding value |
| External production database (Postgres, etc.) | SQLite is sufficient for a local-first, single-user capstone demo |
