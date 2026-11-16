"use client";

import React from "react";
import {
  ShieldAlert,
  KeyRound,
  Fingerprint,
  BookOpen,
  FileText,
  ScanSearch,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Database,
} from "lucide-react";
import styles from "./OverviewView.module.css";
import { DashboardViewKey } from "../Sidebar";

interface OverviewViewProps {
  onNavigate: (view: DashboardViewKey) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const stats = [
    {
      label: "Account Exposures",
      value: "HIBP Feed",
      icon: ShieldAlert,
      iconClass: styles.statIconBreach,
      footer: "Real-time query ready",
      actionView: "breach-check" as DashboardViewKey,
    },
    {
      label: "Password Hardening",
      value: "k-Anonymity",
      icon: KeyRound,
      iconClass: styles.statIconPassword,
      footer: "Zero-plaintext leakage",
      actionView: "password" as DashboardViewKey,
    },
    {
      label: "Browser Tracking Surface",
      value: "GPU & Audio",
      icon: Fingerprint,
      iconClass: styles.statIconFingerprint,
      footer: "55+ font probe metrics",
      actionView: "fingerprint" as DashboardViewKey,
    },
    {
      label: "Public Broker Records",
      value: "7 Directories",
      icon: BookOpen,
      iconClass: styles.statIconOptOut,
      footer: "Suppression checklist",
      actionView: "opt-out" as DashboardViewKey,
    },
  ];

  const modules = [
    {
      key: "scanner" as DashboardViewKey,
      name: "Multi-Vector Privacy Scanner",
      desc: "Audit email addresses, EXIF metadata, document properties, and extract OCR text from social screenshots.",
      badge: "Deep Dossier",
      icon: ScanSearch,
    },
    {
      key: "breach-check" as DashboardViewKey,
      name: "Breach Radar & Compromise",
      desc: "Search global credential dump archives, inspect chronological breach timelines, and categorize exposed data classes.",
      badge: "HIBP v3",
      icon: ShieldAlert,
    },
    {
      key: "password" as DashboardViewKey,
      name: "Password k-Anonymity Hub",
      desc: "Locally compute 40-character SHA-1 hashes to query breach corpuses, plus zxcvbn entropy and offline cracking rates.",
      badge: "Local Crypto",
      icon: KeyRound,
    },
    {
      key: "fingerprint" as DashboardViewKey,
      name: "Deep Browser & Hardware Signals",
      desc: "Inspect WebGL GPU pipelines, system font vectors, speech synthesis voices, and detect if Brave farbling is active.",
      badge: "Farbling Probes",
      icon: Fingerprint,
    },
    {
      key: "opt-out" as DashboardViewKey,
      name: "Data Broker Opt-Out Dossier",
      desc: "Step-by-step verified suppression procedures for Whitepages, Spokeo, BeenVerified, Intelius, and other people aggregators.",
      badge: "Progress Tracker",
      icon: BookOpen,
    },
    {
      key: "privacy-generator" as DashboardViewKey,
      name: "Statutory Privacy Notices",
      desc: "Generate binding GDPR Article 17 erasure and CCPA Do-Not-Sell formal notices with one-click company pre-fills.",
      badge: "Export & Email",
      icon: FileText,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroTag}>
          <Sparkles size={13} />
          <span>Zero-Knowledge Defense Enclave</span>
        </div>
        <h1 className={styles.heroTitle}>
          Command Your <span className={styles.gradientText}>Digital Exposure</span>
        </h1>
        <p className={styles.heroDescription}>
          Privacy Scanner provides open-source, mathematically anonymized intelligence to audit personal data leaks, verify browser fingerprint defenses, and suppress data broker records without database retention.
        </p>
      </div>

      {/* Top Health Indicators */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={styles.statCard}
              onClick={() => onNavigate(stat.actionView)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={`${styles.statIcon} ${stat.iconClass}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statFooter}>
                <span>{stat.footer}</span>
                <ArrowRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Intelligence Modules */}
      <div className={styles.sectionGroup}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>
            <Layers size={18} className={styles.sectionTitleIcon} />
            <span>Privacy & Security Intelligence Modules</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Select a module below to launch the active dashboard engine
          </p>
        </div>

        <div className={styles.launchersGrid}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.key}
                className={styles.launcherCard}
                onClick={() => onNavigate(mod.key)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.launcherTop}>
                  <div className={styles.launcherIconBox}>
                    <Icon size={22} />
                  </div>
                  <div className={styles.launcherInfo}>
                    <div className={styles.launcherName}>{mod.name}</div>
                    <div className={styles.launcherDesc}>{mod.desc}</div>
                  </div>
                </div>

                <div className={styles.launcherBottom}>
                  <span className={styles.launcherBadge}>{mod.badge}</span>
                  <span className={styles.launcherAction}>
                    <span>Launch Module</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zero-Knowledge Architecture Card */}
      <div className={styles.architectureCard}>
        <div className={styles.archHeader}>
          <div>
            <div className={styles.archTitle}>Zero-Knowledge Cryptographic Spec</div>
            <div className={styles.archSubtitle}>
              Rigorous ephemeral execution designed to safeguard researcher and user privacy
            </div>
          </div>
          <div className={styles.archBadge}>
            <CheckCircle2 size={14} />
            <span>100% In-Memory Pipeline</span>
          </div>
        </div>

        <div className={styles.archGrid}>
          <div className={styles.archBox}>
            <div className={styles.archBoxHeader}>
              <span className={styles.archBoxTitle}>Storage & Retention Guarantees</span>
              <span className={styles.archBoxStatus}>Active</span>
            </div>
            <ul className={styles.archList}>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>✓</span>
                <span>
                  <strong>Zero Database Storage:</strong> Inquiries, uploaded file buffers, and generated dossiers exist solely in ephemeral memory and are dropped upon response dispatch.
                </span>
              </li>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>✓</span>
                <span>
                  <strong>k-Anonymity Hashing:</strong> Passwords never transit the network in plaintext; only the first 5 SHA-1 hex characters are sent to remote APIs.
                </span>
              </li>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>✓</span>
                <span>
                  <strong>Pure Client Execution:</strong> Browser hardware signatures and font detection execute natively in client-side JavaScript.
                </span>
              </li>
            </ul>
          </div>

          <div className={styles.archBox}>
            <div className={styles.archBoxHeader}>
              <span className={styles.archBoxTitle}>Threat Intelligence Pipeline</span>
              <span className={styles.archBoxStatus}>v0.1.0-prod</span>
            </div>
            <ul className={styles.archList}>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>→</span>
                <span>
                  <strong>Concurrent Probes:</strong> Scanners execute concurrently using isolated <code>Promise.allSettled</code> routines for fault tolerance.
                </span>
              </li>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>→</span>
                <span>
                  <strong>Weighted Risk Scoring:</strong> Dynamic threat model calculates overall footprint severity on a 0–100 scale with actionable remediation advice.
                </span>
              </li>
              <li className={styles.archListItem}>
                <span className={styles.archBullet}>→</span>
                <span>
                  <strong>Farbling Detection:</strong> Tests if anti-tracking shields inject randomized noise into your Canvas, WebGL, and Audio buffers.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
