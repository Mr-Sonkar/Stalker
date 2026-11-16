"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Menu,
  X,
  Fingerprint,
  FileText,
  KeyRound,
  ShieldAlert,
  BookOpen,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Overview", icon: Sparkles },
    { href: "/breach-check", label: "Breach Radar", icon: ShieldAlert },
    { href: "/breach-check?tab=password", label: "Password Check", icon: KeyRound },
    { href: "/fingerprint", label: "Fingerprint", icon: Fingerprint },
    { href: "/opt-out", label: "Opt-Out Guide", icon: BookOpen },
    { href: "/privacy-generator", label: "Legal Generator", icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("?")) {
      const basePath = href.split("?")[0];
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2ca6e9]/15 bg-[#03080e]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3 transition-opacity">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#169b5c] via-[#2ca6e9] to-[#e0e260] p-[1.5px] shadow-lg shadow-[#169b5c]/25 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#03080e]">
              <ShieldCheck className="h-5 w-5 text-[#2ca6e9] transition-colors group-hover:text-[#e0e260]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-[#fafeff] via-[#2ca6e9] to-[#169b5c] bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg">
                Privacy Scanner
              </span>
              <span className="hidden rounded-full border border-[#e0e260]/30 bg-[#e0e260]/10 px-2 py-0.5 text-[10px] font-semibold text-[#e0e260] sm:inline-block">
                Zero-Knowledge
              </span>
            </div>
            <p className="hidden text-[10px] text-slate-400 sm:block">
              Personal Exposure & Footprint Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-[#2ca6e9]/15 bg-[#040e1a]/70 p-1 backdrop-blur-md lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] text-[#fafeff] shadow-sm shadow-[#169b5c]/30 font-semibold"
                    : "text-slate-300 hover:bg-[#16364a]/50 hover:text-[#fafeff]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[#169b5c]/30 bg-[#169b5c]/10 px-3 py-1 text-xs font-medium text-[#169b5c] sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e0e260] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#169b5c]"></span>
            </span>
            <span className="font-semibold text-[#fafeff]">Local Engine Active</span>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2ca6e9]/20 bg-[#040e1a]/80 text-slate-300 transition-colors hover:border-[#2ca6e9]/50 hover:text-[#fafeff] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#2ca6e9]/20 bg-[#03080e]/95 px-4 pt-3 pb-6 shadow-2xl backdrop-blur-2xl lg:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-r from-[#169b5c]/25 to-[#2ca6e9]/25 text-[#fafeff] border border-[#2ca6e9]/40 font-semibold"
                      : "text-slate-300 hover:bg-[#071927] hover:text-[#fafeff]"
                  }`}
                >
                  <Icon className="h-4 w-4 text-[#2ca6e9]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#2ca6e9]/15 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Engine: Client/Local Enclave</span>
            <span className="text-[#e0e260] font-semibold">100% Ephemeral</span>
          </div>
        </div>
      )}
    </header>
  );
}
