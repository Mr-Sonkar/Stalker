"use client";

import React from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  ScanSearch,
  ShieldAlert,
  KeyRound,
  Fingerprint,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import styles from "./Sidebar.module.css";

export type DashboardViewKey =
  | "overview"
  | "scanner"
  | "breach-check"
  | "password"
  | "fingerprint"
  | "opt-out"
  | "privacy-generator";

interface SidebarProps {
  activeView: DashboardViewKey;
  onSelectView: (view: DashboardViewKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    {
      group: "Intelligence",
      items: [
        {
          key: "overview" as DashboardViewKey,
          label: "Executive Overview",
          icon: LayoutDashboard,
          badge: "Live",
        },
        {
          key: "scanner" as DashboardViewKey,
          label: "Multi-Vector Scanner",
          icon: ScanSearch,
          badge: "Dossier",
        },
        {
          key: "breach-check" as DashboardViewKey,
          label: "Breach Radar",
          icon: ShieldAlert,
          badge: "HIBP v3",
        },
      ],
    },
    {
      group: "Identity & Hardening",
      items: [
        {
          key: "password" as DashboardViewKey,
          label: "Password Audit",
          icon: KeyRound,
          badge: "k-Anon",
        },
        {
          key: "fingerprint" as DashboardViewKey,
          label: "Browser Signals",
          icon: Fingerprint,
          badge: "GPU/Font",
        },
      ],
    },
    {
      group: "Remediation & Rights",
      items: [
        {
          key: "opt-out" as DashboardViewKey,
          label: "Data Broker Suppression",
          icon: BookOpen,
          badge: "Checklist",
        },
        {
          key: "privacy-generator" as DashboardViewKey,
          label: "Statutory Legal Notices",
          icon: FileText,
          badge: "GDPR/CCPA",
        },
      ],
    },
  ];

  const handleItemClick = (key: DashboardViewKey) => {
    onSelectView(key);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
          mobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        {/* Brand header */}
        <div className={styles.brandContainer}>
          <div
            className={styles.brandLink}
            onClick={() => handleItemClick("overview")}
            role="button"
            tabIndex={0}
            title="Privacy Scanner Dashboard"
          >
            <div className={styles.brandIcon}>
              <ShieldCheck size={22} />
            </div>
            {!collapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>Privacy Scanner</span>
                <span className={styles.brandSubtitle}>Command Enclave</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navContainer}>
          {navItems.map((group, groupIdx) => (
            <div key={groupIdx}>
              {!collapsed && (
                <div className={styles.navGroupTitle}>{group.group}</div>
              )}
              {group.items.map((item) => {
                const isActive = activeView === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleItemClick(item.key)}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={styles.itemIcon} size={18} />
                    {!collapsed && (
                      <>
                        <span className={styles.itemLabel}>{item.label}</span>
                        {item.badge && (
                          <span
                            className={`${styles.itemBadge} ${
                              isActive ? styles.itemBadgeActive : ""
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.statusCard}>
              <div className={styles.statusDot} />
              <div className={styles.statusText}>
                <span className={styles.statusLabel}>Enclave Active</span>
                <span className={styles.statusSub}>100% In-Memory RAM</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
