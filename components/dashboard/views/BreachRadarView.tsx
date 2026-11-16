"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  Calendar,
  Database,
  Globe,
  Users,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { BreachResult } from "@/lib/hibp/email";
import styles from "./BreachRadarView.module.css";

export function BreachRadarView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedEmail, setSearchedEmail] = useState<string>("");

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsLoading(true);
    setError(null);
    setBreaches(null);
    setSearchedEmail(cleanEmail);

    try {
      const response = await fetch("/api/breach-check/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to query breach database");
      }

      setBreaches(data.breaches || []);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute breakdown data classes
  const dataClassCounts = useMemo(() => {
    if (!breaches || breaches.length === 0) return [];
    const counts: Record<string, number> = {};
    breaches.forEach((b) => {
      b.dataClasses.forEach((dc) => {
        counts[dc] = (counts[dc] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [breaches]);

  // Compute sorted breaches by date descending
  const sortedBreaches = useMemo(() => {
    if (!breaches || breaches.length === 0) return [];
    return [...breaches].sort(
      (a, b) => new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime()
    );
  }, [breaches]);

  // Summary counts
  const totalBreaches = breaches ? breaches.length : 0;
  const verifiedCount = breaches ? breaches.filter((b) => b.verified).length : 0;
  const sensitiveCount = breaches ? breaches.filter((b) => b.sensitive).length : 0;
  const totalExposedAccounts = breaches
    ? breaches.reduce((sum, b) => sum + (b.affectedAccounts || 0), 0)
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Dark Web &amp; Breach Intelligence
        </div>
        <h1 className={styles.title}>
          Identity Breach <span className={styles.titleAccent}>Radar</span>
        </h1>
        <p className={styles.subtitle}>
          Investigate compromised credentials, paste dumps, and dark web exfiltrations across commercial and enterprise platforms via Have I Been Pwned intelligence.
        </p>
      </div>

      {/* Search Input Card */}
      <div className={styles.searchCard}>
        <form onSubmit={handleEmailCheck} className={styles.searchForm}>
          <div className={styles.inputWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="email"
              className={styles.input}
              placeholder="Enter email address (e.g. user@example.com)..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={styles.searchBtn}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Interrogating Breach Radar...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Scan for Breaches</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Results State */}
      {breaches !== null && (
        <>
          {breaches.length === 0 ? (
            <div className={styles.cleanCard}>
              <CheckCircle2 size={44} color="var(--brand-emerald)" />
              <div className={styles.cleanTitle}>Clean Record — Zero Breaches Detected</div>
              <p className={styles.cleanDesc}>
                We found no records associated with <strong>{searchedEmail}</strong> in any cataloged public dumps, stealer logs, or compromised databases.
              </p>
            </div>
          ) : (
            <>
              {/* Metrics Summary Grid */}
              <div className={styles.summaryGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Total Breaches</span>
                  <span className={`${styles.metricValue} ${styles.metricValueAlert}`}>
                    {totalBreaches}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Verified Incidents</span>
                  <span className={`${styles.metricValue} ${styles.metricValueWarning}`}>
                    {verifiedCount}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Sensitive Exfiltrations</span>
                  <span className={`${styles.metricValue} ${styles.metricValueAlert}`}>
                    {sensitiveCount}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Accounts in Incidents</span>
                  <span className={`${styles.metricValue} ${styles.metricValueCyan}`}>
                    {totalExposedAccounts.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Data Classes Breakdown */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <Database size={18} color="var(--brand-cyan)" />
                    <h3 className={styles.sectionTitle}>Exposed Data Types Breakdown</h3>
                  </div>
                  <span className={styles.sectionBadge}>
                    {dataClassCounts.length} Distinct Categories
                  </span>
                </div>
                <div className={styles.categoryGrid}>
                  {dataClassCounts.map(([className, count], idx) => {
                    const isSensitive =
                      className.toLowerCase().includes("password") ||
                      className.toLowerCase().includes("ssn") ||
                      className.toLowerCase().includes("financial") ||
                      className.toLowerCase().includes("credit");

                    return (
                      <div
                        key={idx}
                        className={`${styles.categoryPill} ${
                          isSensitive ? styles.categoryPillSensitive : ""
                        }`}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isSensitive && (
                            <AlertTriangle size={13} color="#fca5a5" style={{ flexShrink: 0 }} />
                          )}
                          <span>{className}</span>
                        </div>
                        <span
                          className={`${styles.catCountBadge} ${
                            isSensitive ? styles.catCountSensitive : ""
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <Calendar size={18} color="var(--brand-cyan)" />
                    <h3 className={styles.sectionTitle}>Chronological Incident Timeline</h3>
                  </div>
                  <span className={styles.sectionBadge}>
                    {sortedBreaches.length} Historical Events
                  </span>
                </div>

                <div className={styles.timelineTrack}>
                  {sortedBreaches.map((breach, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.breachItemCard}>
                        <div className={styles.breachTop}>
                          <span className={styles.breachName}>{breach.title}</span>
                          <span className={styles.breachDate}>
                            {new Date(breach.breachDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className={styles.breachMetaRow}>
                          {breach.domain && (
                            <span className={styles.metaItem}>
                              <Globe size={13} color="var(--brand-cyan)" />
                              <span>{breach.domain}</span>
                            </span>
                          )}
                          <span className={styles.metaItem}>
                            <Users size={13} />
                            <span>
                              {breach.affectedAccounts?.toLocaleString() || "N/A"} records
                            </span>
                          </span>
                        </div>

                        <div className={styles.dataPillsRow}>
                          {breach.dataClasses.map((dc, j) => {
                            const isPwd = dc.toLowerCase().includes("password");
                            return (
                              <span
                                key={j}
                                className={`${styles.dataTag} ${
                                  isPwd ? styles.dataTagPassword : ""
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
            </>
          )}
        </>
      )}
    </div>
  );
}
