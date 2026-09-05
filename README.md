# Privacy Scanner 🛡️

A personal privacy scanning and digital exposure intelligence web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## ✨ Features

- **Breach Radar:** Detects exposure in data dumps, credential leaks, and stealer-log databases.
- **OSINT Footprint:** Cryptographically probes public profiles and avatars (Gravatar SHA-256).
- **Domain Verification:** Analyzes email domains, DNS MX records, and filters disposable inboxes.
- **Threat Scoring Algorithm:** Calculates a unified threat score (0–100) with risk tiering (`CLEAN`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
- **Prisma + SQLite Database:** Local-first storage with `User` and `ScanResult` models (ready for PostgreSQL).
- **Interactive UI:** Real-time scanning feedback, breach breakdowns, and tailored privacy remediation checklists.

---

## 🚀 Quick Start for Collaborators

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd stalker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
*(Default settings use local SQLite database `file:./dev.db`)*

### 4. Initialize Database & Generate Prisma Client
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack & Scripts

| Tool | Purpose |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite (`dev.db`) via Prisma ORM |
| **Icons** | Lucide React |

### Available Scripts
- `npm run dev` — Starts local development server on port 3000.
- `npm run build` — Builds the optimized production application.
- `npm run lint` — Runs ESLint code quality checks.
- `npm run format` — Formats all project files with Prettier.
- `npx prisma studio` — Opens the interactive Prisma web database GUI on port 5555.
