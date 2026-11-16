"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ZXCVBNResult } from "zxcvbn";
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Search,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Fingerprint,
} from "lucide-react";
import { sha1, getHashPrefix, getHashSuffix, parsePwnedPasswordsResponse } from "@/lib/hibp/passwords";
import styles from "./PasswordAuditView.module.css";

export function PasswordAuditView() {
  // Engine 1: Breach Check State
  const [breachPassword, setBreachPassword] = useState("");
  const [showBreachPassword, setShowBreachPassword] = useState(false);
  const [isBreachLoading, setIsBreachLoading] = useState(false);
  const [breachResult, setBreachResult] = useState<{
    count: number;
    error?: string;
    hashPrefix?: string;
  } | null>(null);

  // Engine 2: Real-time Entropy State
  const [entropyPassword, setEntropyPassword] = useState("");
  const [showEntropyPassword, setShowEntropyPassword] = useState(false);
  const [zxcvbnLib, setZxcvbnLib] = useState<((pwd: string) => ZXCVBNResult) | null>(null);

  useEffect(() => {
    import("zxcvbn").then((module) => {
      setZxcvbnLib(() => module.default);
    });
  }, []);

  const entropyResult: ZXCVBNResult | null = useMemo(() => {
    if (entropyPassword && zxcvbnLib) {
      return zxcvbnLib(entropyPassword);
    }
    return null;
  }, [entropyPassword, zxcvbnLib]);

  const entropyScore = entropyResult ? entropyResult.score : 0;

  const scoreLabels = [
    { label: "Very Weak", color: styles.segmentActiveRed, textClass: styles.ratingTextRed },
    { label: "Weak", color: styles.segmentActiveOrange, textClass: styles.ratingTextOrange },
    { label: "Fair", color: styles.segmentActiveAmber, textClass: styles.ratingTextAmber },
    { label: "Good", color: styles.segmentActiveCyan, textClass: styles.ratingTextCyan },
    { label: "Strong & Resilient", color: styles.segmentActiveEmerald, textClass: styles.ratingTextEmerald },
  ];

  const currentScoreConfig = scoreLabels[entropyScore] || scoreLabels[0];

  const handleBreachCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breachPassword) return;

    setIsBreachLoading(true);
    setBreachResult(null);

    try {
      // 1. Hash locally in browser with Web Crypto API
      const fullHash = await sha1(breachPassword);

      // 2. Split for k-anonymity (first 5 chars public, remaining 35 private)
      const prefix = getHashPrefix(fullHash);
      const suffix = getHashSuffix(fullHash);

      // 3. Send ONLY 5 chars to API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

      if (!response.ok) {
        throw new Error(`HIBP API returned status code ${response.status}`);
      }

      const responseText = await response.text();

      // 4. Compare suffix locally in the browser
      const count = parsePwnedPasswordsResponse(responseText, suffix);

      setBreachResult({ count, hashPrefix: prefix });
    } catch (err: unknown) {
      const error = err as Error;
      setBreachResult({
        count: 0,
        error: error?.message || "Failed to query k-anonymity range API.",
      });
    } finally {
      setIsBreachLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Cryptographic Zero-Knowledge Lab
        </div>
        <h1 className={styles.title}>
          Password Defense &amp; <span className={styles.titleAccent}>Entropy Laboratory</span>
        </h1>
        <p className={styles.subtitle}>
          Verify passwords against 800+ million compromised credentials using <strong>k-Anonymity mathematical privacy</strong>, and measure attack resistance using mathematical pattern recognition.
        </p>
      </div>

      <div className={styles.auditGrid}>
        {/* Engine 1: k-Anonymity HIBP Exposure Check */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.iconBox}>
                <Shield size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Engine 1: Breach Exposure Check</h3>
                <p className={styles.cardSubtitle}>
                  k-Anonymity SHA-1 lookup (plaintext never leaves device)
                </p>
              </div>
            </div>
            <span className={styles.tagPill}>HIBP v3</span>
          </div>

          <form onSubmit={handleBreachCheck} className={styles.formColumn}>
            <div className={styles.inputGroup}>
              <input
                type={showBreachPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Enter password to verify against breach dumps..."
                value={breachPassword}
                onChange={(e) => setBreachPassword(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowBreachPassword(!showBreachPassword)}
                aria-label={showBreachPassword ? "Hide password" : "Show password"}
              >
                {showBreachPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isBreachLoading || !breachPassword}
              className={styles.checkBtn}
            >
              {isBreachLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Computing SHA-1 &amp; Querying Range...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Audit Against Known Breaches</span>
                </>
              )}
            </button>
          </form>

          {breachResult && (
            <div>
              {breachResult.error ? (
                <div className={styles.warningBox}>
                  <AlertTriangle size={16} />
                  <span>{breachResult.error}</span>
                </div>
              ) : breachResult.count > 0 ? (
                <div className={styles.resultPwned}>
                  <div className={styles.resultTitleRow}>
                    <ShieldAlert size={20} color="#ef4444" />
                    <span className={styles.resultPwnedTitle}>Compromised in Known Data Dumps</span>
                  </div>
                  <div>
                    This exact credential string appeared{" "}
                    <span className={styles.resultCount}>
                      {breachResult.count.toLocaleString()}
                    </span>{" "}
                    times in verified security breaches.
                  </div>
                  <p className={styles.resultDesc}>
                    Do not use this password for any account. It has been exposed in public wordlists and is actively weaponized in credential-stuffing attacks.
                  </p>
                  {breachResult.hashPrefix && (
                    <div className={styles.hashPrefixNote}>
                      Queried Hash Prefix: {breachResult.hashPrefix}***** (Zero plaintext transmitted)
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.resultClean}>
                  <div className={styles.resultTitleRow}>
                    <ShieldCheck size={20} color="var(--brand-emerald)" />
                    <span className={styles.resultCleanTitle}>No Exposure Found</span>
                  </div>
                  <p className={styles.resultDesc}>
                    This password was not detected in any monitored breach collections (0 occurrences). While clean in public dumps, ensure it also meets entropy standards before use.
                  </p>
                  {breachResult.hashPrefix && (
                    <div className={styles.hashPrefixNote}>
                      Queried Hash Prefix: {breachResult.hashPrefix}***** (k-Anonymity Verified)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.protocolBox}>
            <Fingerprint className={styles.protocolIcon} size={18} />
            <div>
              <strong>Cryptographic Zero-Knowledge Guarantee:</strong> Your password is converted into a 160-bit SHA-1 hash locally in your browser memory. Only the first 5 characters ({`"prefix"`}) are submitted to the API. The matching is completed on-device. Your password is never transmitted across the network.
            </div>
          </div>
        </div>

        {/* Engine 2: Real-time Entropy & zxcvbn Resistance */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.iconBox}>
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Engine 2: Real-Time Entropy</h3>
                <p className={styles.cardSubtitle}>
                  zxcvbn dictionary &amp; spatial pattern analysis
                </p>
              </div>
            </div>
            <span className={styles.tagPill}>Offline Core</span>
          </div>

          <div className={styles.entropyContainer}>
            <div className={styles.inputGroup}>
              <input
                type={showEntropyPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Test a password pattern for entropy..."
                value={entropyPassword}
                onChange={(e) => setEntropyPassword(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowEntropyPassword(!showEntropyPassword)}
                aria-label={showEntropyPassword ? "Hide password" : "Show password"}
              >
                {showEntropyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {entropyPassword ? (
              <div className={styles.entropyActiveContainer}>
                {/* Meter segments */}
                <div className={styles.meterGroup}>
                  <div className={styles.meterHeader}>
                    <span className={styles.meterLabel}>Entropy Resistance:</span>
                    <span
                      className={`${styles.ratingText} ${currentScoreConfig.textClass}`}
                    >
                      {currentScoreConfig.label}
                    </span>
                  </div>
                  <div className={styles.meterTrack}>
                    {[0, 1, 2, 3].map((segmentIndex) => {
                      const isActive = entropyScore > segmentIndex;
                      return (
                        <div
                          key={segmentIndex}
                          className={`${styles.segment} ${isActive ? currentScoreConfig.color : ""}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {entropyResult && (
                  <div className={styles.analysisBox}>
                    <div className={styles.statRow}>
                      <span>Offline Fast Hashing (10¹⁰/sec):</span>
                      <span className={styles.statValueMono}>
                        {entropyResult.crack_times_display.offline_fast_hashing_1e10_per_second}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span>Offline Slow Hashing (10⁴/sec):</span>
                      <span className={styles.statValueMono}>
                        {entropyResult.crack_times_display.offline_slow_hashing_1e4_per_second}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span>Online Rate-Limited (100/hr):</span>
                      <span className={styles.statValueCyan}>
                        {entropyResult.crack_times_display.online_throttling_100_per_hour}
                      </span>
                    </div>

                    {entropyResult.feedback.warning && (
                      <div className={styles.warningBox}>
                        <AlertTriangle size={15} className={styles.warningIcon} />
                        <span>{entropyResult.feedback.warning}</span>
                      </div>
                    )}

                    {entropyResult.feedback.suggestions &&
                      entropyResult.feedback.suggestions.length > 0 && (
                        <div className={styles.recommendationsWrapper}>
                          <span className={styles.recommendationsTitle}>
                            Hardening Recommendations
                          </span>
                          <ul className={styles.tipsList}>
                            {entropyResult.feedback.suggestions.map((s, idx) => (
                              <li key={idx} className={styles.tipItem}>
                                <CheckCircle2 className={styles.tipIcon} size={14} />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyEntropyNote}>
                Type any sample password or phrase above to evaluate dictionary resistance, repetitive keystrokes, and brute-force complexity locally in real-time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
