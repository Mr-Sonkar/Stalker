"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldAlert, Key, Search, Loader2, CheckCircle2 } from "lucide-react";
import { BreachTimeline } from "./BreachTimeline";
import { BreachDataBreakdown } from "./BreachDataBreakdown";
import { PasswordCheck } from "./PasswordCheck";
import { BreachResult } from "@/lib/hibp/email";
import styles from "./BreachCheckDashboard.module.css";

export function BreachCheckDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "password" ? "password" : "email";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: "email" | "password") => {
    router.replace(`/breach-check${tab === "password" ? "?tab=password" : ""}`, {
      scroll: false,
    });
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setBreaches(null);

    try {
      const response = await fetch("/api/breach-check/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check breaches");
      }

      setBreaches(data.breaches || []);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Tab Switcher */}
      <div className={styles.tabSwitcher}>
        <button
          type="button"
          onClick={() => handleTabChange("email")}
          className={`${styles.tabBtn} ${activeTab === "email" ? styles.tabBtnActive : ""}`}
        >
          <ShieldAlert className={styles.tabIconYellow} size={16} />
          <span>Email Breach Radar</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("password")}
          className={`${styles.tabBtn} ${activeTab === "password" ? styles.tabBtnActive : ""}`}
        >
          <Key className={styles.tabIconCyan} size={16} />
          <span>Password k-Anonymity Check</span>
        </button>
      </div>

      {/* Content View */}
      <div className={styles.contentView}>
        {activeTab === "email" && (
          <div className={styles.emailViewContainer}>
            {/* Search Input Card */}
            <div className={styles.searchCard}>
              <div className={styles.searchHeader}>
                <div className={styles.titleGroup}>
                  <div className={styles.iconBox}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className={styles.title}>Account Breach Radar</h3>
                    <p className={styles.subtitle}>
                      Cross-references global breach archives and credential dump indexes
                    </p>
                  </div>
                </div>
                <span className={styles.badge}>
                  Real-Time Query
                </span>
              </div>

              <form onSubmit={handleEmailCheck} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to audit (e.g. name@domain.com)..."
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className={styles.submitBtn}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Scanning Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>Check Exposure</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Email Chips */}
              <div className={styles.chipRow}>
                <span>Test account:</span>
                <button
                  type="button"
                  onClick={() => setEmail("account-exists@hibp-integration-tests.com")}
                  className={styles.sampleChip}
                >
                  account-exists@hibp-integration-tests.com
                </button>
              </div>

              {error && (
                <div className={styles.errorBanner}>
                  {error}
                </div>
              )}
            </div>

            {/* Breaches View */}
            {breaches && (
              <div className={styles.breachesContainer}>
                {breaches.length > 0 ? (
                  <>
                    <div className={styles.highRiskAlert}>
                      <div className={styles.alertLeft}>
                        <div className={styles.alertIconBox}>
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <h4 className={styles.alertTitle}>
                            Compromised in {breaches.length} Data Breaches
                          </h4>
                          <p className={styles.alertDesc}>
                            Immediate password reset and 2FA activation recommended
                          </p>
                        </div>
                      </div>
                      <span className={styles.alertBadge}>
                        High Risk
                      </span>
                    </div>

                    <BreachDataBreakdown breaches={breaches} />
                    <BreachTimeline breaches={breaches} />
                  </>
                ) : (
                  <div className={styles.cleanCard}>
                    <div className={styles.cleanIconBox}>
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className={styles.cleanTitle}>No Breaches Found!</h4>
                    <p className={styles.cleanDesc}>
                      This email address does not appear in any known public breach indexes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "password" && (
          <div>
            <PasswordCheck />
          </div>
        )}
      </div>
    </div>
  );
}
