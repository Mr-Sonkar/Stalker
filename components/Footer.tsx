import React from "react";
import Link from "next/link";
import { Shield, ShieldCheck, Lock, Terminal } from "lucide-react";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand info */}
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <div className={styles.brandIcon}>
                <Shield size={16} />
              </div>
              <span className={styles.brandName}>Privacy Scanner</span>
              <span className={styles.versionBadge}>
                v0.1.0-secure
              </span>
            </div>
            <p className={styles.brandDesc}>
              A private intelligence enclave engineered for security professionals, researchers, and everyday users to audit digital exposure without sacrificing privacy.
            </p>
            <div className={styles.tagRow}>
              <span className={styles.tagPill}>
                <Lock className={styles.tagIconEmerald} size={12} /> No DB Retention
              </span>
              <span className={styles.tagPill}>
                <ShieldCheck className={styles.tagIconCyan} size={12} /> k-Anonymity SHA-1
              </span>
              <span className={styles.tagPill}>
                <Terminal className={styles.tagIconLime} size={12} /> Client-Side Probes
              </span>
            </div>
          </div>

          {/* Quick links: Audits */}
          <div>
            <h4 className={styles.columnTitle}>
              Audit Engines
            </h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/breach-check" className={styles.footerLink}>
                  Email Breach Radar
                </Link>
              </li>
              <li>
                <Link href="/breach-check?tab=password" className={styles.footerLink}>
                  Password Pwned Check
                </Link>
              </li>
              <li>
                <Link href="/fingerprint" className={styles.footerLink}>
                  Deep Browser Fingerprint
                </Link>
              </li>
              <li>
                <Link href="/opt-out" className={styles.footerLink}>
                  Data Broker Suppression
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Remediation & Legal */}
          <div>
            <h4 className={styles.columnTitle}>
              Privacy Defense
            </h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/opt-out" className={styles.footerLink}>
                  Data Broker Opt-Out Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy-generator" className={styles.footerLink}>
                  GDPR / CCPA Erasure Generator
                </Link>
              </li>
              <li>
                <a
                  href="https://haveibeenpwned.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.footerLink}
                >
                  HIBP Intelligence Feed ↗
                </a>
              </li>
              <li>
                <Link href="/#architecture" className={styles.footerLink}>
                  Zero-Knowledge Spec
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomText}>
            <span>Engineered with mathematical zero-knowledge privacy</span>
          </div>
          <div className={styles.bottomText}>
            <span>Privacy Scanner Enclave</span>
            <span>•</span>
            <span>Client-side Security First</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
