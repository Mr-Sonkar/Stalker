"use client";

import React, { useState, useEffect } from "react";
import styles from "./DashboardApp.module.css";
import { Sidebar, DashboardViewKey } from "./Sidebar";
import { Header } from "./Header";
import { OverviewView } from "./views/OverviewView";
import { ScannerView } from "./views/ScannerView";
import { BreachRadarView } from "./views/BreachRadarView";
import { PasswordAuditView } from "./views/PasswordAuditView";
import { FingerprintView } from "./views/FingerprintView";
import { BrokerOptOutView } from "./views/BrokerOptOutView";
import { LegalGeneratorView } from "./views/LegalGeneratorView";

const VALID_VIEWS: DashboardViewKey[] = [
  "overview",
  "scanner",
  "breach-check",
  "password",
  "fingerprint",
  "opt-out",
  "privacy-generator",
];

interface DashboardAppProps {
  initialView?: DashboardViewKey;
}

export function DashboardApp({ initialView = "overview" }: DashboardAppProps) {
  const [activeView, setActiveView] = useState<DashboardViewKey>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as DashboardViewKey;
      if (VALID_VIEWS.includes(hash)) {
        return hash;
      }
    }
    return initialView;
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync with browser navigation (back/forward or manual hash updates)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as DashboardViewKey;
      if (VALID_VIEWS.includes(hash)) {
        setActiveView(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSelectView = (view: DashboardViewKey) => {
    setActiveView(view);
    setMobileOpen(false);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${view}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Container */}
      <div className={styles.mainContainer}>
        <Header
          activeView={activeView}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className={styles.contentArea}>
          <div key={activeView} className={styles.viewContainer}>
            {activeView === "overview" && (
              <OverviewView onNavigate={handleSelectView} />
            )}
            {activeView === "scanner" && <ScannerView />}
            {activeView === "breach-check" && <BreachRadarView />}
            {activeView === "password" && <PasswordAuditView />}
            {activeView === "fingerprint" && <FingerprintView />}
            {activeView === "opt-out" && <BrokerOptOutView />}
            {activeView === "privacy-generator" && <LegalGeneratorView />}
          </div>
        </main>

        {/* Global Enclave Footer */}
        <footer className={styles.footerBar}>
          <div className={styles.footerLeft}>
            <span className={styles.footerDot} />
            <span>ENCLAVE ACTIVE: CLIENT-SIDE ZERO-KNOWLEDGE ARCHITECTURE</span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerPalette}>Huemint Brand Palette</span>
            <span className={styles.footerDivider}>•</span>
            <button
              type="button"
              onClick={() => handleSelectView("overview")}
              className={styles.footerLink}
            >
              Dashboard Root
            </button>
            <span className={styles.footerDivider}>•</span>
            <button
              type="button"
              onClick={() => handleSelectView("opt-out")}
              className={styles.footerLink}
            >
              Broker Dossier
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
