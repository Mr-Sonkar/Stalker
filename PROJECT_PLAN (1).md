# Privacy Scanner — Project Plan

**Last Updated:** September 6, 2026
**Status:** Living document — update checkboxes as work completes

---

## 🎯 Goal

Ship a working, demoable privacy scanning tool in four phases, where **every phase ends in something complete enough to present** — so the project is never in a half-broken state if time runs short before the mentor review.

---

## Phase 1 — Core Scan Loop (Detailed)

**Status: 85% Complete**

### Goal
A user can enter an email address and get back a scored privacy report using real, external data sources.

### Completed Tasks
- [x] Next.js + TypeScript + Tailwind + Prisma/SQLite project setup
- [x] Breach Radar Engine (`breaches.ts`) — HIBP live API + local fallback catalog
- [x] Domain Verification Engine (`email-check.ts`) — MX record lookup, disposable email detection
- [x] OSINT Footprint Scanner (`gravatar.ts`) — hashed email Gravatar lookup
- [x] Threat Scoring Algorithm — weighted 0–100 score, tiered risk levels
- [x] Prisma schema (`User`, `ScanResult`) + migrations
- [x] Scan API route (`app/api/scan/route.ts`)
- [x] Results UI (`ScanResultView.tsx`) with score, breach cards, OSINT cards, recommendations

### Remaining Tasks with Acceptance Criteria

#### Task 1.1: Implement `pastes.ts` Scanner Module
**File:** `lib/scanner/pastes.ts`
**Dependencies:** `types.ts`, `lib/utils.ts` (fetch with timeout)

**Acceptance Criteria:**
- [ ] Queries HIBP Pastes API (`https://haveibeenpwned.com/api/v3/pastes/{account}`)
- [ ] Uses SHA-1 hash of email (HIBP requirement for pastes)
- [ ] 5-second timeout with graceful degradation
- [ ] Returns `PasteFinding[]` with: `id`, `source`, `title`, `date`, `emailCount`
- [ ] On API failure: returns `{ dataUnavailable: true, error: string }` — never throws
- [ ] Unit test with mock HIBP response (success, 404, timeout, rate limit)

**Implementation Steps:**
1. Add `PasteFinding` and `PasteResult` types to `types.ts` (a test can't type-check against a shape that doesn't exist yet)
2. Write failing test: `lib/scanner/__tests__/pastes.test.ts`
3. Implement `checkPastes(email: string): Promise<PasteResult>`
4. Integrate into `runPrivacyScan()` orchestrator
5. Extend scoring algorithm: +5 points per paste found (capped at 15) — and confirm the orchestrator's *final* score is still clamped to 100 once this is added (see the scoring gap flagged in `PROJECT_DOCUMENTATION.md`)
6. Add paste cards to `ScanResultView.tsx`
7. Run tests: `npm test -- lib/scanner/__tests__/pastes.test.ts` (requires a test runner to be chosen first — see the flag in `ARCHITECTURE.md`'s Development Tooling table)

#### Task 1.2: Add Unit Tests for Existing Scanner Modules
**Files:** `lib/scanner/__tests__/breaches.test.ts`, `email-check.test.ts`, `gravatar.test.ts`

**Acceptance Criteria:**
- [ ] Each module has ≥3 test cases (success, error, edge case)
- [ ] Tests use mocked external dependencies (MSW or manual mocks)
- [ ] Coverage ≥80% for scanner modules
- [ ] Run: `npm test -- lib/scanner/__tests__`

### Milestone
User submits an email → sees a full scored report with breach, domain, OSINT, and paste-site findings.

---

## Phase 2 — File-Based Scanning (Detailed)

**Status: Not Started**

### Goal
Extend the scan beyond email lookups into the user's own files — the "hidden in your own files" layer of the pitch.

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

### Milestone
User can scan an email **and** upload a photo or document in the same flow, and see what personal data is embedded in that file.

---

## Phase 3 — Self-Report Identity Features (Detailed)

**Status: Not Started**

### Goal
Cover personal exposure that lives outside official APIs — bios, screenshots, weak passwords — without ever scraping platforms that prohibit it.

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

### Milestone
The full "self-service, own-data-only" story is demoable end-to-end: known breaches → hidden file metadata → self-submitted bio/screenshot text → password hygiene.

---

## Phase 4 — Polish & Reporting (Detailed)

**Status: Not Started**

### Goal
Round out the project with low-risk, high-value additions that strengthen the demo without adding architectural complexity.

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

### Milestone
Project is presentation-ready: polished UI language, a tangible take-home artifact (PDF report), and two "quick win" demo features (fingerprint, opt-out guide) that require no live external API calls to work.

---

## 🗂️ Feature-to-Phase Reference Table

| Feature | Phase | New files |
|---|---|---|
| Breach check | 1 (done) | `breaches.ts` |
| Domain/MX check | 1 (done) | `email-check.ts` |
| Gravatar OSINT | 1 (done) | `gravatar.ts` |
| Paste-site scan | 1 (remaining) | `pastes.ts` |
| Image/document metadata scan | 2 | `metadata.ts` |
| Screenshot/bio OCR + PII detection | 3 | `profile-text.ts` |
| Password strength checker | 3 | Client component only |
| Browser fingerprint demo | 4 | Client component only |
| PDF export | 4 | `app/api/export/route.ts` |
| Data broker opt-out guide | 4 | Static page, no scanner module |

---

## ⚠️ Explicitly Out of Scope

These were considered and deliberately excluded — worth stating plainly to mentors so it reads as a decision, not an oversight:

| Excluded item | Reason |
|---|---|
| Live Tor/.onion dark web crawling | Legal/safety risk, outside defensible student project scope |
| Instagram/Facebook scraping | Violates platform ToS; replaced with self-report screenshot/text analysis (Phase 3) |
| User authentication / accounts | Not needed for project thesis; adds complexity without adding value |
| Multi-user / production database migration | Out of scope for a single-user capstone demo |

---

## 📅 Suggested Time Allocation

For a typical capstone timeline, weight the phases roughly as:

| Phase | Relative effort |
|---|---|
| Phase 1 (remaining: pastes.ts) | 5% |
| Phase 2 (metadata scanning) | 30% |
| Phase 3 (self-report + password) | 35% |
| Phase 4 (polish + reporting) | 30% |

Phase 2 and 3 carry the most new technical ground (file parsing, OCR) — budget the most time there. Phase 4 is designed to be compressible if you're running short, since none of it blocks the core product from being demoable after Phase 3.
