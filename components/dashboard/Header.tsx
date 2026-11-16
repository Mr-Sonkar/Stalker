"use client";

import React from "react";
import {
  Menu,
  ShieldCheck,
  ServerOff,
  Cpu,
  ChevronRight,
} from "lucide-react";
import styles from "./Header.module.css";
import { DashboardViewKey } from "./Sidebar";

interface HeaderProps {
  activeView: DashboardViewKey;
  onOpenMobile: () => void;
}

const VIEW_TITLES: Record<DashboardViewKey, string> = {
  overview: "Executive Intelligence Overview",
  scanner: "Multi-Vector Privacy Scanner",
  "breach-check": "Breach Radar & Account Compromise",
  password: "Password Audit & k-Anonymity Hub",
  fingerprint: "Deep Hardware & Browser Signals",
  "opt-out": "Data Broker Suppression Dossier",
  "privacy-generator": "Statutory Legal Notice Generator",
};

export function Header({ activeView, onOpenMobile }: HeaderProps) {
  const currentTitle = VIEW_TITLES[activeView] || "Dashboard";

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={onOpenMobile}
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbRoot}>Dashboard</span>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{currentTitle}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.badgePill}>
          <div className={styles.pulseDot} />
          <span>Local Engine Active</span>
        </div>

        <div className={styles.quickPill}>
          <ServerOff size={13} color="var(--brand-emerald)" />
          <span>No DB Logging</span>
        </div>

        <div className={styles.quickPill}>
          <ShieldCheck size={13} color="var(--brand-cyan)" />
          <span>k-Anonymity</span>
        </div>
      </div>
    </header>
  );
}
