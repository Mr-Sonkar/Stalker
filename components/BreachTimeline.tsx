import React from "react";
import { BreachResult } from "@/lib/xposedornot/email";
import { Calendar, Users, Globe } from "lucide-react";
import styles from "./BreachTimeline.module.css";

export function BreachTimeline({ breaches }: { breaches: BreachResult[] }) {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  // Sort by breachDate (newest to oldest)
  const sortedBreaches = [...breaches].sort((a, b) => {
    return new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime();
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Calendar className={styles.icon} size={20} />
          <h3 className={styles.title}>Chronological Breach Timeline</h3>
        </div>
        <span className={styles.eventCount}>
          {sortedBreaches.length} Recorded Events
        </span>
      </div>

      <div className={styles.timelineTrack}>
        {sortedBreaches.map((breach, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot} />

            <div className={styles.breachCard}>
              <div className={styles.breachHeader}>
                <h4 className={styles.breachTitle}>
                  {breach.title}
                </h4>
                <span className={styles.breachDate}>
                  {new Date(breach.breachDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className={styles.metaRow}>
                {breach.domain ? (
                  <span className={styles.domainLink}>
                    <Globe size={12} />
                    <span>{breach.domain}</span>
                  </span>
                ) : (
                  <span className={styles.domainUnspecified}>Domain Unspecified</span>
                )}
                <span className={styles.metaDot}>•</span>
                <span className={styles.accountsExposed}>
                  <Users size={12} />
                  <span>{breach.affectedAccounts.toLocaleString()} accounts compromised</span>
                </span>
              </div>

              <div className={styles.dataPillsRow}>
                {(breach.dataClasses || []).map((dc: string, j: number) => {
                  const isPassword = dc.toLowerCase().includes("password");
                  return (
                    <span
                      key={j}
                      className={`${styles.dataPill} ${isPassword ? styles.dataPillPassword : ""
                        }`}
                    >
                      {dc}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
