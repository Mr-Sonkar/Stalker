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
import styles from "./Navbar.module.css";

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
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brandLink}>
          <div className={styles.brandIconWrapper}>
            <div className={styles.brandIconInner}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className={styles.brandTitleRow}>
              <span className={styles.brandTitle}>
                Privacy Scanner
              </span>
              <span className={styles.brandTag}>
                Zero-Knowledge
              </span>
            </div>
            <p className={styles.brandSubtitle}>
              Personal Exposure &amp; Footprint Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator & Mobile Toggle */}
        <div className={styles.rightSection}>
          <div className={styles.statusIndicator}>
            <span className={styles.pulseCircle}>
              <span className={styles.pingDot} />
              <span className={styles.staticDot} />
            </span>
            <span className={styles.statusText}>Local Engine Active</span>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuBtn}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`${styles.mobileNavLink} ${
                  active ? styles.mobileNavLinkActive : ""
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
