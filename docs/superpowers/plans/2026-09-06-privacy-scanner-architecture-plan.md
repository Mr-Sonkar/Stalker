# Privacy Scanner Architecture & Tech Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive architecture document and updated project plan that captures the full tech stack, architectural decisions, and phased implementation roadmap for the Privacy Scanner (Stalker) project.

**Architecture:** This plan consolidates the existing modular scanner pipeline architecture with Next.js 16 App Router, TypeScript strict mode, Tailwind CSS 4, Prisma ORM with SQLite, and a phased 4-phase implementation approach. The architecture follows a fan-out/fan-in orchestration pattern where independent scanner modules run in parallel via Promise.allSettled, with fault isolation and graceful degradation.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), TypeScript 5.x (Strict Mode), Tailwind CSS 4.x, Prisma ORM 6.4.1 with SQLite, Lucide React 1.16.0, clsx + tailwind-merge, ESLint 9.x (flat config), Prettier 3.5.2.

**Spec:** This plan implements the architecture documented in ARCHITECTURE.md and PROJECT_PLAN.md, extending them with detailed tech stack specifications, API contracts, database schema, and implementation task breakdowns.

## Global Constraints

- **Framework Version:** Next.js 16.3.4 (App Router only — no Pages Router)
- **TypeScript:** Strict mode enabled — no `any` types without explicit justification
- **Styling:** Tailwind CSS 4.x with dark-first design system (slate-950 background)
- **Database:** SQLite via Prisma ORM — local-first, no external DB dependencies
- **Scanner Pattern:** Promise.allSettled for all external API calls — fault isolation mandatory
- **API Design:** RESTful endpoints under `/api/` with JSON request/response
- **Authentication:** None — anonymous scans only, retrieval via scanId
- **External APIs:** HIBP (HaveIBeenPwned) for breaches/pastes, Gravatar for OSINT, DNS for MX lookup
- **File Processing:** Server-side only (exifr, pdf-lib, mammoth, tesseract.js)
- **Client-Side Only:** Password strength (zxcvbn), browser fingerprint demo
- **Naming:** Internal codename "Stalker" — must rename before presentation
- **Testing:** Unit tests for scanner modules, integration tests for API routes, E2E for critical flows

---

## Task 1: Update ARCHITECTURE.md with Comprehensive Tech Stack & Architecture Details

**Files:**
- Modify: `C:\Coding\Stalker\ARCHITECTURE.md`

**Interfaces:**
- Consumes: Existing ARCHITECTURE.md content
- Produces: Updated architecture document with expanded sections

- [x] **Step 1: Add Tech Stack Specification Section**

```markdown
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
```

- [x] **Step 2: Add Detailed Component Architecture Section**

```markdown
## 🧱 Detailed Component Architecture

### Frontend Layer (app/, components/)

```
app/
├── api/
│   ├── scan/route.ts          # POST /api/scan - Main scan endpoint
│   ├── export/route.ts        # GET /api/export/:scanId - PDF report generation
│   └── ...                    # Other API routes (planned)
├── globals.css                # Tailwind v4 imports + custom styles
├── layout.tsx                 # Root layout with metadata
└── page.tsx                   # Home page with hero, features, architecture

components/
├── FeatureCard.tsx            # Reusable feature showcase card
├── Footer.tsx                 # Site footer
├── Navbar.tsx                 # Navigation header
├── ScanForm.tsx               # Client-side scan form + results display
├── ScanResultView.tsx         # Detailed scan results visualization
└── ...                        # Additional components (planned)
```

### Scanner Modules (lib/scanner/)

```
lib/scanner/
├── index.ts                   # Main orchestrator (runPrivacyScan)
├── types.ts                   # TypeScript interfaces (ScanReport, etc.)
├── breaches.ts                # HIBP + local breach catalog
├── email-check.ts             # DNS + domain analysis
├── gravatar.ts                # Gravatar OSINT probing
├── pastes.ts                  # HIBP Pastes API
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
├── schema.prisma              # Database schema
└── migrations/                # Migration history

lib/
├── prisma.ts                  # Prisma client singleton
└── utils.ts                   # Utility functions (cn, etc.)
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
  pasteFindings?: PasteFinding[];      // Phase 1
  metadataFindings?: MetadataFinding[]; // Phase 2
  profileTextFindings?: ProfileTextFinding[]; // Phase 3
  recommendations: Recommendation[];
}

// Sub-interfaces defined per module
interface BreachFinding { /* ... */ }
interface OSINTFinding { /* ... */ }
interface PasteFinding { /* ... */ }
interface MetadataFinding { /* ... */ }
interface ProfileTextFinding { /* ... */ }
```

---

## Task 2: Update PROJECT_PLAN.md with Enhanced Implementation Details

**Files:**
- Modify: `C:\Coding\Stalker\PROJECT_PLAN.md`

**Interfaces:**
- Consumes: Existing PROJECT_PLAN.md content
- Produces: Updated project plan with detailed tasks, acceptance criteria, and dependencies

- [x] **Step 1: Add Detailed Phase 1 Remaining Tasks**

```markdown
## Phase 1 — Core Scan Loop (Detailed)

**Status: 100% Complete**

### Goal
A user can enter an email address and get back a scored privacy report using real, external data sources.

### Completed Tasks
- [x] Next.js + TypeScript + Tailwind + Prisma/SQLite project setup
- [x] Breach Radar Engine (`breaches.ts`) — HIBP live API + local fallback catalog
- [x] Domain Verification Engine (`email-check.ts`) — MX record lookup, disposable email detection
- [x] OSINT Footprint Scanner (`gravatar.ts`) — hashed email Gravatar lookup
- [x] Paste-site Scanner (`pastes.ts`) — HIBP Pastes API + local fallback catalog
- [x] Threat Scoring Algorithm — weighted 0–100 score, tiered risk levels
- [x] Prisma schema (`User`, `ScanResult`) + migrations
- [x] Scan API route (`app/api/scan/route.ts`)
- [x] Results UI (`ScanResultView.tsx`) with score, breach cards, OSINT cards, recommendations
- [x] Unit tests for all scanner modules (`breaches.test.ts`, `email-check.test.ts`, `gravatar.test.ts`, `pastes.test.ts`)

### Remaining Tasks with Acceptance Criteria

#### Task 1.2: Add Unit Tests for Existing Scanner Modules
**Files:** `lib/scanner/__tests__/breaches.test.ts`, `email-check.test.ts`, `gravatar.test.ts`

**Acceptance Criteria:**
- [ ] Each module has ≥3 test cases (success, error, edge case)
- [ ] Tests use mocked external dependencies (MSW or manual mocks)
- [ ] Coverage ≥80% for scanner modules
- [ ] Run: `npm test -- lib/scanner/__tests__`
```

- [x] **Step 2: Expand Phase 2 with Detailed File Metadata Tasks**

```markdown
## Phase 2 — File-Based Scanning (Detailed)

**Status: Not Started**

### Goal
Extend scanning to user-uploaded files — extract embedded metadata (EXIF, PDF info, DOCX properties) that reveals location, device, author, timestamps.

### New Files to Create

| File | Responsibility |
|------|----------------|
| `lib/scanner/metadata.ts` | Main metadata orchestrator |
| `lib/scanner/metadata/image-metadata.ts` | EXIF extraction via exifr |
| `lib/scanner/metadata/pdf-metadata.ts` | PDF metadata via pdf-lib |
| `lib/scanner/metadata/docx-metadata.ts` | DOCX metadata via mammoth |
| `lib/scanner/__tests__/metadata.test.ts` | Unit tests for all metadata extractors |
| `components/MetadataStripper.tsx` | Bonus: clean file download (if time) |

### Detailed Tasks

#### Task 2.1: Extend Types for Metadata Findings
**File:** `lib/scanner/types.ts`
**Acceptance Criteria:**
- [ ] Add `MetadataFinding` interface with: `fileName`, `fileType`, `findings: MetadataItem[]`
- [ ] Add `MetadataItem`: `type` (gps|device|software|author|timestamp), `label`, `value`, `riskLevel`
- [ ] Extend `ScanReport` with optional `metadataFindings: MetadataFinding[]`

#### Task 2.2: Implement Image Metadata Extraction
**File:** `lib/scanner/metadata/image-metadata.ts`
**Dependencies:** `exifr` package
**Acceptance Criteria:**
- [ ] Extract: GPS coordinates, device make/model, datetime, software, orientation
- [ ] Support: JPEG, PNG, HEIC, TIFF
- [ ] Return structured findings with risk levels (GPS = HIGH, Device = MODERATE, Software = LOW)
- [ ] Handle missing EXIF gracefully (return empty findings, not error)
- [ ] Unit test with sample images (with/without EXIF)

#### Task 2.3: Implement PDF Metadata Extraction
**File:** `lib/scanner/metadata/pdf-metadata.ts`
**Dependencies:** `pdf-lib` package
**Acceptance Criteria:**
- [ ] Extract: Author, Creator, Producer, CreationDate, ModDate, Title, Subject, Keywords
- [ ] Risk levels: Author/Creator = MODERATE, Dates = LOW, Title/Subject = LOW
- [ ] Handle encrypted/corrupted PDFs gracefully
- [ ] Unit test with sample PDFs

#### Task 2.4: Implement DOCX Metadata Extraction
**File:** `lib/scanner/metadata/docx-metadata.ts`
**Dependencies:** `mammoth` package
**Acceptance Criteria:**
- [ ] Extract: Author, LastModifiedBy, Created, Modified, RevisionNumber, Application
- [ ] Risk levels: Author/LastModifiedBy = MODERATE, Dates = LOW
- [ ] Handle .docx only (not legacy .doc)
- [ ] Unit test with sample DOCX files

#### Task 2.5: Build Metadata Orchestrator
**File:** `lib/scanner/metadata.ts`
**Acceptance Criteria:**
- [ ] Detect file type from MIME/magic bytes
- [ ] Route to appropriate extractor
- [ ] Return unified `MetadataFinding[]`
- [ ] Integrate into `runPrivacyScan()` with Promise.allSettled
- [ ] Scoring: GPS +15, Device/Author +10, Software/Dates +5 (capped at 30)

#### Task 2.6: Add File Upload to API & UI
**Files:** `app/api/scan/route.ts`, `components/ScanForm.tsx`
**Acceptance Criteria:**
- [ ] API accepts multipart/form-data with `file` field (max 10MB)
- [ ] UI: drag-and-drop zone + file preview + remove button
- [ ] Client-side validation: allowed types (image/*, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- [ ] File processed server-side, never stored permanently
- [ ] Integration test: upload image with GPS → appears in report
```

- [x] **Step 3: Expand Phase 3 with Detailed Self-Report Tasks**

```markdown
## Phase 3 — Self-Report Identity Features (Detailed)

**Status: Not Started**

### Goal
Analyze user-submitted text/screenshots for PII exposure — bios, profile screenshots, weak passwords — without scraping prohibited platforms.

### New Files to Create

| File | Responsibility |
|------|----------------|
| `lib/scanner/profile-text.ts` | Main profile text orchestrator |
| `lib/scanner/profile-text/ocr.ts` | tesseract.js OCR wrapper |
| `lib/scanner/profile-text/pii-detection.ts` | Regex PII patterns |
| `lib/scanner/__tests__/profile-text.test.ts` | Unit tests |
| `components/PasswordStrength.tsx` | Client-only zxcvbn widget |
| `components/ScanForm.tsx` (extended) | Bio text area + screenshot upload |

### Detailed Tasks

#### Task 3.1: Extend Types for Profile Text Findings
**File:** `lib/scanner/types.ts`
**Acceptance Criteria:**
- [ ] Add `ProfileTextFinding`: `source` (bio|screenshot), `piiType`, `matchedText`, `riskLevel`, `recommendation`
- [ ] PII types: phone, email, address, dob, ssn, credit-card, ip, crypto-wallet
- [ ] Extend `ScanReport` with optional `profileTextFindings: ProfileTextFinding[]`

#### Task 3.2: Implement OCR Module
**File:** `lib/scanner/profile-text/ocr.ts`
**Dependencies:** `tesseract.js`
**Acceptance Criteria:**
- [ ] Accept image buffer, return extracted text + confidence score
- [ ] Support: PNG, JPEG, WebP
- [ ] Minimum confidence threshold: 60% (configurable)
- [ ] Timeout: 30 seconds max
- [ ] Graceful degradation on failure (return empty, log warning)
- [ ] Unit test with sample screenshots

#### Task 3.3: Implement PII Detection
**File:** `lib/scanner/profile-text/pii-detection.ts`
**Acceptance Criteria:**
- [ ] Regex patterns for: phone (US/international), email, address (US), DOB (MM/DD/YYYY, DD/MM/YYYY), SSN, credit card (Luhn), IPv4/IPv6, Bitcoin/Ethereum addresses
- [ ] Returns structured findings with matched text, position, risk level
- [ ] Risk levels: SSN/credit-card = CRITICAL, phone/email/address = HIGH, DOB = MODERATE, IP/crypto = LOW
- [ ] Comprehensive unit tests with positive/negative cases

#### Task 3.4: Build Profile Text Orchestrator
**File:** `lib/scanner/profile-text.ts`
**Acceptance Criteria:**
- [ ] Accepts: `bioText?: string`, `screenshotBuffer?: Buffer`
- [ ] Runs OCR on screenshot if provided
- [ ] Runs PII detection on bio text + OCR output
- [ ] Deduplicates findings across sources
- [ ] Integrates into `runPrivacyScan()`
- [ ] Scoring: CRITICAL +25, HIGH +15, MODERATE +10, LOW +5 (capped at 40)

#### Task 3.5: Build Password Strength Widget (Client-Only)
**File:** `components/PasswordStrength.tsx`
**Dependencies:** `zxcvbn` (bundle size ~700KB - load dynamically)
**Acceptance Criteria:**
- [ ] Loads zxcvbn dynamically on first interaction (code splitting)
- [ ] Live strength meter: 0-4 score with color coding
- [ ] Shows: crack time estimate, warnings, suggestions
- [ ] No API calls — entirely client-side
- [ ] Accessible: ARIA labels, keyboard navigable
- [ ] Unit test with known weak/strong passwords

#### Task 3.6: Extend ScanForm for Self-Report Inputs
**File:** `components/ScanForm.tsx`
**Acceptance Criteria:**
- [ ] Add "Paste your bio" textarea (optional)
- [ ] Add "Upload profile screenshot" file input (optional)
- [ ] Add password strength widget below email input (always visible)
- [ ] Form submits all data together to `/api/scan`
- [ ] Client-side validation for file types/sizes
```

- [x] **Step 4: Expand Phase 4 with Detailed Polish Tasks**

```markdown
## Phase 4 — Polish & Reporting (Detailed)

**Status: Not Started**

### Detailed Tasks

#### Task 4.1: Browser Fingerprint Demo (Client-Only)
**File:** `components/BrowserFingerprint.tsx`
**Acceptance Criteria:**
- [ ] Reads: navigator.userAgent, navigator.language, navigator.platform, navigator.hardwareConcurrency, navigator.deviceMemory, screen.width/height/colorDepth, Intl.DateTimeFormat().resolvedOptions().timeZone, canvas fingerprint (basic)
- [ ] Displays: organized card grid with labels + values
- [ ] No backend involvement — purely educational
- [ ] "Copy to clipboard" button for sharing
- [ ] Accessible table layout

#### Task 4.2: PDF Export of Scan Report
**File:** `app/api/export/route.ts`
**Dependencies:** `@react-pdf/renderer`
**Acceptance Criteria:**
- [ ] Accepts `scanId` query param
- [ ] Fetches saved ScanReport from database
- [ ] Renders multi-page PDF: Cover (score + target), Breaches, OSINT, Metadata, Profile Text, Recommendations
- [ ] Uses design system colors (adapted for print)
- [ ] Returns `application/pdf` with `Content-Disposition: attachment`
- [ ] "Download Report" button on `ScanResultView.tsx`
- [ ] Integration test: generate PDF for known scanId

#### Task 4.3: Data Broker Opt-Out Guide
**File:** `app/data-brokers/page.tsx` (new route)
**Acceptance Criteria:**
- [ ] Static page with table: Broker Name | Opt-Out URL | Difficulty | Time Estimate
- [ ] Covers: Spokeo, WhitePages, PeopleFinders, BeenVerified, Intelius, MyLife, Radaris, TruePeopleSearch, FastPeopleSearch, FamilyTreeNow
- [ ] Links go directly to opt-out forms
- [ ] No backend logic — pure content
- [ ] SEO metadata for discoverability

#### Task 4.4: Rename "Stalker" Codename
**Files:** All references in codebase
**Acceptance Criteria:**
- [ ] Search/replace: "Stalker" → "Privacy Scanner" (or chosen name)
- [ ] Update: package.json name, README, CLAUDE.md, PROJECT_DOCUMENTATION.md, comments
- [ ] Verify no "stalker" strings remain in user-visible text

#### Task 4.5: UI Copy Pass
**Files:** All component files
**Acceptance Criteria:**
- [ ] Replace "Dark Web Scan" → "Surface & Paste-Site Scan"
- [ ] Ensure honest framing: "We check public paste sites" not "We scan the dark web"
- [ ] All feature descriptions match PROJECT_DOCUMENTATION.md
- [ ] Accessibility audit: alt text, ARIA labels, heading hierarchy
```
```

---

## Task 3: Create API Contract Documentation

**Files:**
- Create: `C:\Coding\Stalker\docs\api-contracts.md`

**Interfaces:**
- Consumes: ARCHITECTURE.md, existing API routes
- Produces: Formal API contract for all endpoints

- [x] **Step 1: Document POST /api/scan Contract**

```markdown
# API Contracts

## POST /api/scan

### Request
Content-Type: `multipart/form-data` (preferred) or `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address (RFC 5322) |
| file | File | No | Image/PDF/DOCX for metadata scanning (max 10MB) |
| bioText | string | No | Plain text bio for PII analysis (max 5000 chars) |
| screenshot | File | No | Profile screenshot for OCR (max 5MB, image/*) |

### Response (200)
```json
{
  "success": true,
  "scanId": "scan_cuid",
  "report": {
    "id": "scan_cuid",
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
    "pasteFindings": [...],      // Phase 1
    "metadataFindings": [...],   // Optional - Phase 2
    "profileTextFindings": [...], // Optional - Phase 3
    "recommendations": [...]
  }
}
```

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_EMAIL | "Invalid email format" |
| 400 | FILE_TOO_LARGE | "File exceeds 10MB limit" |
| 400 | INVALID_FILE_TYPE | "Unsupported file type" |
| 413 | PAYLOAD_TOO_LARGE | "Request payload too large" |
| 500 | SCAN_FAILED | "Scan execution failed" |
| 503 | SERVICE_UNAVAILABLE | "Scanner modules temporarily unavailable" |

## GET /api/export/:scanId

### Request
| Param | Type | Required |
|-------|------|----------|
| scanId | string (cuid) | Yes |

### Response (200)
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="privacy-report-{scanId}.pdf"`

### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 404 | SCAN_NOT_FOUND | "Scan report not found" |
| 500 | EXPORT_FAILED | "PDF generation failed" |
```
```

---

## Task 4: Create Database Schema Documentation

**Files:**
- Create: `C:\Coding\Stalker\docs\database-schema.md`

**Interfaces:**
- Consumes: `prisma/schema.prisma`
- Produces: Detailed schema documentation with indexes, relationships, migration strategy

- [ ] **Step 1: Document Current Schema + Planned Extensions**

```markdown
# Database Schema Documentation

## Current Schema (Phase 1)

### User Model
```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  scanResults ScanResult[]
}
```

### ScanResult Model
```prisma
model ScanResult {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       String   // "EMAIL_PRIVACY_AUDIT"
  resultJson String   // Full ScanReport serialized
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}
```

## Planned Schema Extensions

### Phase 2: Add File Metadata Tracking
```prisma
model ScanResult {
  // ... existing fields
  fileName        String?   // Original uploaded file name
  fileType        String?   // MIME type
  fileSize        Int?      // Bytes
  hasMetadata     Boolean   @default(false)
}
```

### Phase 3: Add Profile Text Tracking
```prisma
model ScanResult {
  // ... existing fields
  hasBioText      Boolean   @default(false)
  hasScreenshot   Boolean   @default(false)
  piiFindingsCount Int      @default(0)
}
```

### Future: Scheduled Scans (Out of Scope)
```prisma
model ScheduledScan {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  email       String
  frequency   String   // "daily", "weekly", "monthly"
  isActive    Boolean  @default(true)
  lastRun     DateTime?
  nextRun     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Migration Strategy

| Phase | Migration | Command |
|-------|-----------|---------|
| 2 | Add file tracking fields | `npx prisma migrate dev --name add_file_tracking` |
| 3 | Add profile text fields | `npx prisma migrate dev --name add_profile_text_tracking` |

## Prisma Client Singleton Pattern

**File:** `lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Reasoning:** Prevents connection exhaustion during Next.js hot reload in development.
```
```

---

## Task 5: Create Scanner Module Development Guide

**Files:**
- Create: `C:\Coding\Stalker\docs\scanner-module-guide.md`

**Interfaces:**
- Consumes: `lib/scanner/types.ts`, existing scanner modules
- Produces: Developer guide for adding new scanner modules

- [ ] **Step 1: Document Module Contract & Patterns**

```markdown
# Scanner Module Development Guide

## Module Contract

Every scanner module MUST follow this exact contract:

```typescript
// lib/scanner/<module-name>.ts

import type { ScanReport, <Module>Result } from './types'

export async function <moduleName>Scan(input: <Module>Input): Promise<<Module>Result> {
  // 1. Validate input
  // 2. Call external API / process data with timeout
  // 3. Handle ALL errors internally — NEVER throw
  // 4. Return structured result matching <Module>Result type
}

// Result type MUST include failure metadata:
interface <Module>Result {
  success: boolean
  data?: <Module>Data
  error?: string
  dataUnavailable?: boolean  // For graceful degradation
}
```

## Required Patterns

### 1. Timeout Wrapper (All External Calls)
```typescript
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ])
}
```

### 2. Graceful Degradation (Never Throw)
```typescript
export async function breachesScan(email: string): Promise<BreachesResult> {
  try {
    const data = await withTimeout(fetchHIBP(email), 5000)
    return { success: true, data }
  } catch (error) {
    // Log for debugging, return structured failure
    console.warn('[breaches] Scan failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      dataUnavailable: true  // Signals UI to show "data unavailable" not "error"
    }
  }
}
```

### 3. Type-First Development
- Add new interfaces to `types.ts` FIRST
- Run `npx tsc --noEmit` to verify types
- Then implement module

### 4. Testing Requirements
- Unit test file: `lib/scanner/__tests__/<module>.test.ts`
- Test cases: success, timeout, API error, rate limit, malformed response
- Mock external dependencies (no real network calls in tests)
- Target: ≥80% coverage per module

## Integration Checklist

When adding a new module:
- [ ] Add result interface to `types.ts`
- [ ] Add field to `ScanReport` interface (optional for phased rollout)
- [ ] Create module file with contract compliance
- [ ] Add unit tests
- [ ] Import and add to `Promise.allSettled` in `index.ts`
- [ ] Extend scoring algorithm in `index.ts`
- [ ] Add UI card component in `ScanResultView.tsx`
- [ ] Update API response type if needed
- [ ] Run full test suite: `npm test`
- [ ] Verify manual scan works end-to-end
```
```

---

## Task 6: Create Threat Scoring Algorithm Specification

**Files:**
- Create: `C:\Coding\Stalker\docs\threat-scoring.md`

**Interfaces:**
- Consumes: `lib/scanner/index.ts` scoring logic
- Produces: Formal scoring specification for consistency

- [ ] **Step 1: Document Complete Scoring Formula**

```markdown
# Threat Scoring Algorithm Specification

## Overview
Weighted point system producing 0-100 risk score, mapped to 5 threat tiers.

## Scoring Factors (Current - Phase 1)

| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| Breach Found | Per breach (HIBP) | +20 | 50 (max 2-3 breaches) |
| Plaintext Password | Breach contains plaintext passwords | +25 | 25 |
| Hashed Password | Breach contains hashed passwords | +15 | 15 |
| OSINT Exposure | Gravatar profile found | +10 | 10 |
| Disposable Email | Domain in disposable list | +15 | 15 |

## Planned Scoring Extensions

### Phase 2: Metadata Scoring
| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| GPS Coordinates | EXIF contains GPS | +15 | 15 |
| Device Info | Camera make/model exposed | +10 | 10 |
| Author Name | PDF/DOCX author field | +10 | 10 |
| Software Fingerprint | Creation software exposed | +5 | 5 |
| Timestamps | Creation/modification dates | +5 | 5 |

**Phase 2 Cap: 30 points**

### Phase 3: Profile Text / PII Scoring
| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| SSN / Credit Card | Detected in text/OCR | +25 | 25 |
| Phone / Email / Address | Detected in text/OCR | +15 | 30 |
| Date of Birth | Detected in text/OCR | +10 | 10 |
| IP Address | Detected in text/OCR | +5 | 5 |
| Crypto Wallet | Detected in text/OCR | +5 | 5 |
| Weak Password | zxcvbn score 0-1 | +20 | 20 |
| Reused Password | zxcvbn detects common patterns | +10 | 10 |

**Phase 3 Cap: 50 points**

## Tier Mapping

| Score Range | Tier | Label | Color | Description |
|-------------|------|-------|-------|-------------|
| 0 | 0 | CLEAN | Emerald | No exposure detected |
| 1-24 | 1 | LOW | Green | Minimal exposure |
| 25-49 | 2 | MODERATE | Yellow | Notable exposure — action recommended |
| 50-74 | 3 | HIGH | Orange | Significant exposure — immediate action needed |
| 75-100 | 4 | CRITICAL | Red | Severe exposure — urgent remediation required |

## Algorithm Implementation (lib/scanner/index.ts)

```typescript
function calculateRiskScore(report: ScanReport): { score: number; tier: ThreatTier } {
  let score = 0
  
  // Breach scoring
  score += Math.min(report.breaches.length * 20, 50)
  if (report.summary.hasPlaintextPasswordLeak) score += 25
  else if (report.breaches.some(b => b.hasHashedPasswords)) score += 15
  
  // OSINT scoring
  if (report.accountExposures.some(a => a.found)) score += 10
  
  // Domain scoring
  if (report.domainInfo.isDisposable) score += 15
  
  // Phase 2: Metadata (when implemented)
  if (report.metadataFindings) {
    const hasGPS = report.metadataFindings.some(f => f.findings.some(i => i.type === 'gps'))
    const hasDevice = report.metadataFindings.some(f => f.findings.some(i => i.type === 'device'))
    const hasAuthor = report.metadataFindings.some(f => f.findings.some(i => i.type === 'author'))
    if (hasGPS) score += 15
    if (hasDevice) score += 10
    if (hasAuthor) score += 10
    // ... capped at 30
  }
  
  // Phase 3: Profile Text (when implemented)
  if (report.profileTextFindings) {
    // ... PII-based scoring capped at 40
  }
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))
  
  // Determine tier
  const tier = score === 0 ? 'CLEAN' :
               score <= 24 ? 'LOW' :
               score <= 49 ? 'MODERATE' :
               score <= 74 ? 'HIGH' : 'CRITICAL'
   
  return { score, tier }
}
```

## Testing Requirements

- Unit tests for each scoring factor in isolation
- Integration tests for combined scoring
- Edge case: all factors maxed → score = 100 (CRITICAL)
- Edge case: no findings → score = 0 (CLEAN)
- Regression test: known test emails produce expected tiers
```
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-06-privacy-scanner-architecture-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**