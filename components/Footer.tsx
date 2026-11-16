import React from "react";
import Link from "next/link";
import { Shield, ShieldCheck, Lock, Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2ca6e9]/15 bg-[#03080e]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#169b5c]/10 border border-[#169b5c]/30 text-[#169b5c]">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-[#fafeff] tracking-tight">Privacy Scanner</span>
              <span className="rounded-full border border-[#e0e260]/30 bg-[#e0e260]/10 px-2 py-0.5 text-[10px] font-semibold text-[#e0e260]">
                v0.1.0-secure
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              A private intelligence enclave engineered for security professionals, researchers, and everyday users to audit digital exposure without sacrificing privacy.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-[#169b5c]/20 bg-[#071927]/80 px-2 py-1 text-[11px] text-slate-300">
                <Lock className="h-3 w-3 text-[#169b5c]" /> No DB Retention
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#2ca6e9]/20 bg-[#071927]/80 px-2 py-1 text-[11px] text-slate-300">
                <ShieldCheck className="h-3 w-3 text-[#2ca6e9]" /> k-Anonymity SHA-1
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#e0e260]/20 bg-[#071927]/80 px-2 py-1 text-[11px] text-slate-300">
                <Terminal className="h-3 w-3 text-[#e0e260]" /> Client-Side Probes
              </span>
            </div>
          </div>

          {/* Quick links: Audits */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fafeff]">
              Audit Engines
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/breach-check" className="transition-colors hover:text-[#2ca6e9]">
                  Email Breach Radar
                </Link>
              </li>
              <li>
                <Link href="/breach-check?tab=password" className="transition-colors hover:text-[#2ca6e9]">
                  Password Pwned Check
                </Link>
              </li>
              <li>
                <Link href="/fingerprint" className="transition-colors hover:text-[#2ca6e9]">
                  Deep Browser Fingerprint
                </Link>
              </li>
              <li>
                <Link href="/opt-out" className="transition-colors hover:text-[#2ca6e9]">
                  Data Broker Suppression
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Remediation & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fafeff]">
              Privacy Defense
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/opt-out" className="transition-colors hover:text-[#169b5c]">
                  Data Broker Opt-Out Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy-generator" className="transition-colors hover:text-[#169b5c]">
                  GDPR / CCPA Erasure Generator
                </Link>
              </li>
              <li>
                <a
                  href="https://haveibeenpwned.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[#e0e260]"
                >
                  HIBP Intelligence Feed ↗
                </a>
              </li>
              <li>
                <Link href="/#architecture" className="transition-colors hover:text-[#2ca6e9]">
                  Zero-Knowledge Spec
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#2ca6e9]/10 pt-6 text-[11px] text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Privacy Scanner Project. Open intelligence for all.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3 w-3 text-[#e0e260] fill-[#e0e260]/40" /> for privacy & security.
          </p>
        </div>
      </div>
    </footer>
  );
}
