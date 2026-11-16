import React, { useMemo } from "react";
import { BreachResult } from "@/lib/xposedornot/email";
import { Database, AlertCircle } from "lucide-react";
import styles from "./BreachDataBreakdown.module.css";

export function BreachDataBreakdown({ breaches }: { breaches: BreachResult[] }) {
  // Always call useMemo before any conditional return to abide by React Rules of Hooks
  const classCounts = useMemo(() => {
    if (!breaches || breaches.length === 0) return [];

    const counts: Record<string, number> = {};
    breaches.forEach((b) => {
      (b.dataClasses || []).forEach((dc: string) => {
        counts[dc] = (counts[dc] || 0) + 1;
      });
    });

    // Sort by frequency (highest first), then alphabetically
    return Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [breaches]);

  if (!breaches || breaches.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Database className={styles.icon} size={20} />
          <h3 className={styles.title}>Exposed Data Breakdown</h3>
        </div>
        <span className={styles.categoryCount}>
          {classCounts.length} Categories
        </span>
      </div>

      <p className={styles.subtitle}>
        Aggregate distribution of compromised data classes across identified breach incidents.
      </p>

      <div className={styles.grid}>
        {classCounts.map(([className, count], i) => {
          const isSensitive =
            className.toLowerCase().includes("password") ||
            className.toLowerCase().includes("ssn") ||
            className.toLowerCase().includes("financial") ||
            className.toLowerCase().includes("credit");

          return (
            <div
              key={i}
              className={`${styles.item} ${isSensitive ? styles.itemSensitive : ""}`}
            >
              <div className={styles.nameGroup}>
                {isSensitive && <AlertCircle className={styles.alertIcon} size={14} />}
                <span className={styles.className}>{className}</span>
              </div>
              <span
                className={`${styles.countBadge} ${isSensitive ? styles.countBadgeSensitive : ""
                  }`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
