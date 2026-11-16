"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ZXCVBNResult } from "zxcvbn";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import styles from "./PasswordStrength.module.css";

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [zxcvbnLib, setZxcvbnLib] = useState<((pwd: string) => ZXCVBNResult) | null>(null);

  // Load zxcvbn dynamically on mount for performance
  useEffect(() => {
    import("zxcvbn").then((module) => {
      setZxcvbnLib(() => module.default);
    });
  }, []);

  // Compute password score using useMemo rather than setState in an effect
  const result: ZXCVBNResult | null = useMemo(() => {
    if (password && zxcvbnLib) {
      return zxcvbnLib(password);
    }
    return null;
  }, [password, zxcvbnLib]);

  const score = result ? result.score : 0;

  const scoreConfigs = [
    { label: "Very Weak", segmentClass: styles.meterSegmentRed, textClass: styles.statusRed },
    { label: "Weak", segmentClass: styles.meterSegmentOrange, textClass: styles.statusOrange },
    { label: "Fair", segmentClass: styles.meterSegmentYellow, textClass: styles.statusYellow },
    { label: "Good", segmentClass: styles.meterSegmentCyan, textClass: styles.statusCyan },
    { label: "Strong / Resilient", segmentClass: styles.meterSegmentEmerald, textClass: styles.statusEmerald },
  ];

  const currentConfig = scoreConfigs[score] || scoreConfigs[0];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <KeyRound size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Client-Side Password Entropy</h3>
            <p className={styles.subtitle}>Zero network transmission — evaluated strictly in local memory</p>
          </div>
        </div>
        <span className={styles.badge}>
          zxcvbn v4.4
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.inputWrapper}>
          <input
            id="password-entropy-test"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to test entropy..."
            className={styles.input}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeBtn}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {password && (
          <>
            <div className={styles.scoreRow}>
              <span className={styles.scoreLabel}>Estimated Resistance:</span>
              <span className={`${styles.scoreStatus} ${currentConfig.textClass}`}>
                {currentConfig.label} ({score}/4)
              </span>
            </div>

            <div className={styles.meterTrack}>
              {[0, 1, 2, 3].map((segmentIndex) => {
                const isActive = score > segmentIndex;
                return (
                  <div
                    key={segmentIndex}
                    className={`${styles.meterSegment} ${
                      isActive ? currentConfig.segmentClass : ""
                    }`}
                  />
                );
              })}
            </div>

            {result && (
              <div className={styles.feedbackBox}>
                <div className={styles.crackTimesGrid}>
                  <div className={styles.crackTimeItem}>
                    <span className={styles.crackTimeLabel}>Online Throttled (100/hr)</span>
                    <span className={styles.crackTimeValue}>
                      {result.crack_times_display.online_throttling_100_per_hour}
                    </span>
                  </div>
                  <div className={styles.crackTimeItem}>
                    <span className={styles.crackTimeLabel}>Offline Fast (10¹⁰/sec)</span>
                    <span className={styles.crackTimeValue}>
                      {result.crack_times_display.offline_fast_hashing_1e10_per_second}
                    </span>
                  </div>
                </div>

                {result.feedback.warning && (
                  <div className={styles.warningAlert}>
                    <AlertTriangle className={styles.alertIcon} size={14} />
                    <span>{result.feedback.warning}</span>
                  </div>
                )}

                {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                  <ul className={styles.suggestionsList}>
                    {result.feedback.suggestions.map((s, idx) => (
                      <li key={idx} className={styles.suggestionItem}>
                        <CheckCircle2 className={styles.suggestionIcon} size={13} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
