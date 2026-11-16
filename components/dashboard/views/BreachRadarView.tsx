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
  Layers,
  ShieldCheck,
} from "lucide-react";
import { BreachResult } from "@/lib/xposedornot/email";
import styles from "./BreachRadarView.module.css";

interface ProviderComparison {
  hibpCount: number;
  xonCount: number;
  verifiedByBoth: number;
  totalUnique: number;
}

export function BreachRadarView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null);
  const [providerComparison, setProviderComparison] = useState<ProviderComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedEmail, setSearchedEmail] = useState<string>("");

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsLoading(true);
    setError(null);
    setBreaches(null);
    setProviderComparison(null);
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
      setProviderComparison(data.providerComparison || null);
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
          Multi-Provider Dark Web Intelligence
        </div>
        <h1 className={styles.title}>
          Identity Breach <span className={styles.titleAccent}>Radar</span>
        </h1>
        <p className={styles.subtitle}>
          Cross-examine compromised credentials, paste dumps, and dark web exfiltrations using synchronized Have I Been Pwned primary breach feeds and XposedOrNot verification analytics.
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
                We found no records associated with <strong>{searchedEmail}</strong> across Have I Been Pwned or XposedOrNot threat intelligence corpuses.
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

              {/* Provider Comparison & Cross-Correlation */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <Layers size={18} color="var(--brand-chartreuse)" />
                    <h3 className={styles.sectionTitle}>Dual-Provider Intelligence Attribution</h3>
                  </div>
                  <span className={styles.sectionBadge}>
                    Target: {searchedEmail}
                  </span>
                </div>

                <div className={styles.providerGrid}>
                  <div className={`${styles.providerCard} ${styles.providerCardHibp}`}>
                    <div className={`${styles.providerCardHeader} ${styles.providerCardHeaderHibp}`}>
                      <span>Have I Been Pwned</span>
                      <span>Primary Feed</span>
                    </div>
                    <div className={styles.providerCount}>
                      {providerComparison?.hibpCount ?? breaches.filter((b) => b.sources?.includes("HIBP")).length}
                    </div>
                    <div className={styles.providerDesc}>Global commercial dumps, stealer logs, and credential exfiltrations</div>
                  </div>

                  <div className={`${styles.providerCard} ${styles.providerCardXon}`}>
                    <div className={`${styles.providerCardHeader} ${styles.providerCardHeaderXon}`}>
                      <span>XposedOrNot</span>
                      <span>Secondary Verification</span>
                    </div>
                    <div className={styles.providerCount}>
                      {providerComparison?.xonCount ?? breaches.filter((b) => b.sources?.includes("XposedOrNot")).length}
                    </div>
                    <div className={styles.providerDesc}>Independent breach analytics, dark web indexes, and paste monitors</div>
                  </div>

                  <div className={`${styles.providerCard} ${styles.providerCardBoth}`}>
                    <div className={`${styles.providerCardHeader} ${styles.providerCardHeaderBoth}`}>
                      <span>Dual-Verified</span>
                      <span>Cross-Confirmed</span>
                    </div>
                    <div className={styles.providerCount}>
                      {providerComparison?.verifiedByBoth ??
                        breaches.filter((b) => b.sources?.includes("HIBP") && b.sources?.includes("XposedOrNot")).length}
                    </div>
                    <div className={styles.providerDesc}>Incidents independently confirmed across both intelligence providers</div>
                  </div>
                </div>

                {/* Combined Findings Table */}
                <div className={styles.tableWrapper}>
                  <table className={styles.providerTable}>
                    <thead>
                      <tr>
                        <th>Incident Finding</th>
                        <th>Domain</th>
                        <th>HIBP Primary</th>
                        <th>XON Secondary</th>
                        <th>Breach Date</th>
                        <th>Attribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBreaches.map((breach, i) => {
                        const hasHibp = breach.sources?.includes("HIBP");
                        const hasXon = breach.sources?.includes("XposedOrNot");
                        const isBoth = hasHibp && hasXon;

                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{breach.title || breach.name}</td>
                            <td style={{ color: "var(--brand-cyan)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                              {breach.domain || "—"}
                            </td>
                            <td>
                              {hasHibp ? (
                                <span className={`${styles.sourceBadge} ${styles.sourceBadgeHibp}`}>✓ Detected</span>
                              ) : (
                                <span className={styles.sourceNone}>—</span>
                              )}
                            </td>
                            <td>
                              {hasXon ? (
                                <span className={`${styles.sourceBadge} ${styles.sourceBadgeXon}`}>✓ Detected</span>
                              ) : (
                                <span className={styles.sourceNone}>—</span>
                              )}
                            </td>
                            <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                              {new Date(breach.breachDate).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                            </td>
                            <td>
                              {isBoth ? (
                                <span className={`${styles.sourceBadge} ${styles.sourceBadgeBoth}`}>Confirmed by Both</span>
                              ) : (
                                <span className={`${styles.sourceBadge} ${hasHibp ? styles.sourceBadgeHibp : styles.sourceBadgeXon}`}>
                                  {hasHibp ? "HIBP Exclusive" : "XON Exclusive"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                        className={`${styles.categoryPill} ${isSensitive ? styles.categoryPillSensitive : ""
                          }`}
                      >
                        <div className={styles.categoryPillContent}>
                          {isSensitive && (
                            <AlertTriangle size={13} className={styles.sensitiveIcon} />
                          )}
                          <span>{className}</span>
                        </div>
                        <span
                          className={`${styles.catCountBadge} ${isSensitive ? styles.catCountSensitive : ""
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
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span className={styles.breachName}>{breach.title}</span>
                            {breach.sources && (
                              <div style={{ display: "flex", gap: "4px" }}>
                                {breach.sources.map((src) => (
                                  <span
                                    key={src}
                                    className={`${styles.sourceBadge} ${src === "HIBP" ? styles.sourceBadgeHibp : styles.sourceBadgeXon
                                      }`}
                                  >
                                    {src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
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
                                className={`${styles.dataTag} ${isPwd ? styles.dataTagPassword : ""
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
