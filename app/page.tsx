import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { ScanForm } from "@/components/ScanForm";
import {
  ShieldAlert,
  Database,
  Lock,
  Eye,
  Key,
  Terminal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
          {/* Subtle Glow Backgrounds */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 -left-20 -z-10 h-72 w-72 rounded-full bg-cyan-600/10 blur-[100px]" />

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Next-Gen Personal Privacy & Intelligence</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              <span className="block text-white">Privacy Scanner</span>
              <span className="mt-2 block bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Take Control of Your Digital Footprint
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A personal intelligence and auditing tool to discover exposed credentials,
              track data broker listings, and safeguard your online identity from one
              unified dashboard.
            </p>

            {/* Interactive Scan Form */}
            <ScanForm />
          </div>
        </section>

        {/* Feature Cards Section */}
        <section
          id="features"
          className="border-t border-slate-900 bg-slate-950/50 py-12"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                Comprehensive Privacy Audits
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Modular scanning engines built for precision, speed, and privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Key}
                title="Credential Breach Monitor"
                description="Scans across known data dumps and breach indexes for exposed passwords and compromised tokens."
                badge="Breach Radar"
              />
              <FeatureCard
                icon={Eye}
                title="Data Broker Indexing"
                description="Audits people-search engines and data aggregators that store and monetize your personal profile."
                badge="Broker Audit"
              />
              <FeatureCard
                icon={ShieldAlert}
                title="Surface & Dark Web Leak Scan"
                description="Detects public paste sites, hacker forums, and GitHub repositories exposing sensitive API keys or PII."
                badge="Threat Intel"
              />
              <FeatureCard
                icon={Database}
                title="Prisma & SQLite Storage"
                description="Local-first database storage schema with User and ScanResult models ready for SQLite & PostgreSQL."
                badge="Prisma ORM"
              />
              <FeatureCard
                icon={Lock}
                title="Zero-Knowledge Privacy"
                description="All scan queries run locally or with hashed token inputs to ensure queries cannot be traced back."
                badge="Privacy 1st"
              />
              <FeatureCard
                icon={Terminal}
                title="Developer Extensible"
                description="Modular Next.js App Router architecture ready for custom scraper plugins and REST/GraphQL APIs."
                badge="Extensible"
              />
            </div>
          </div>
        </section>

        {/* Architecture & DB Verification Section */}
        <section id="architecture" className="border-t border-slate-900 py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl">
              <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Prisma Schema Architecture
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Pre-configured models for local development with SQLite (`dev.db`).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Schema Synchronized
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-indigo-400">
                      model User
                    </span>
                    <span className="font-mono text-xs text-slate-500">users</span>
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">id</span>
                      <span className="text-amber-400">String @id @default(cuid())</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">email</span>
                      <span className="text-cyan-400">String @unique</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">name</span>
                      <span className="text-slate-400">String?</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">createdAt</span>
                      <span className="text-slate-400">DateTime @default(now())</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">scanResults</span>
                      <span className="text-indigo-400">ScanResult[]</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-indigo-400">
                      model ScanResult
                    </span>
                    <span className="font-mono text-xs text-slate-500">scan_results</span>
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">id</span>
                      <span className="text-amber-400">String @id @default(cuid())</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">userId</span>
                      <span className="text-cyan-400">String (FK User)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">type</span>
                      <span className="text-purple-400">String</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">resultJson</span>
                      <span className="text-emerald-400">String</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">createdAt</span>
                      <span className="text-slate-400">DateTime @default(now())</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
