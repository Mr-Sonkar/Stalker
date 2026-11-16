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
import { ShieldCheck } from "lucide-react";

interface DashboardAppProps {
  initialView?: DashboardViewKey;
}

export function DashboardApp({ initialView = "overview" }: DashboardAppProps) {
  const [activeView, setActiveView] = useState<DashboardViewKey>(initialView);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync hash on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as DashboardViewKey;
      const validViews: DashboardViewKey[] = [
        "overview",
        "scanner",
        "breach-check",
        "password",
        "fingerprint",
        "opt-out",
        "privacy-generator",
      ];
      if (validViews.includes(hash)) {
        setActiveView(hash);
      }
    }
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
            <span style={{ fontFamily: "var(--font-mono)" }}>Huemint Brand Palette</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSelectView("overview")}
              className={styles.footerLink}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Dashboard Root
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSelectView("opt-out")}
              className={styles.footerLink}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Broker Dossier
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
