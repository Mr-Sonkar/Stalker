"use client";

import React, { useState } from "react";
import { Key, AlertTriangle, ShieldCheck, Search, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { sha1, getHashPrefix, getHashSuffix, parsePwnedPasswordsResponse } from "@/lib/hibp/passwords";
import styles from "./PasswordCheck.module.css";

export function PasswordCheck() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; error?: string } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setResult({ count: 0, error: "Please enter a password to evaluate." });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // 1. Hash locally in browser with Web Crypto API
      const fullHash = await sha1(password);

      // 2. Split for k-anonymity (first 5 chars public, remaining 35 private)
      const prefix = getHashPrefix(fullHash);
      const suffix = getHashSuffix(fullHash);

      // 3. Send ONLY 5 chars to API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

      if (!response.ok) {
        throw new Error(`HIBP API Error: ${response.status}`);
      }

      const responseText = await response.text();

      // 4. Compare suffix locally in the browser
      const count = parsePwnedPasswordsResponse(responseText, suffix);

      setResult({ count });
    } catch (err: unknown) {
      const error = err as Error;
      setResult({
        count: 0,
        error: error?.message || "Failed to check password against HIBP database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkCard}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}>
              <Key size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Cryptographic k-Anonymity Check</h3>
              <p className={styles.subtitle}>
                Local SHA-1 hashing • Only 5 prefix characters leave your device
              </p>
            </div>
          </div>
          <span className={styles.badge}>
            HIBP v3 Engine
          </span>
        </div>

        {/* k-Anonymity Explainer Pill */}
        <div className={styles.explainerBox}>
          <div className={styles.explainerHeader}>
            <Shield className={styles.explainerIcon} size={16} />
            <span>How k-Anonymity protects your password:</span>
          </div>
          <p className={styles.explainerText}>
            Your password is never transmitted across the network. Your browser computes a 40-character SHA-1 hash locally. Only the first 5 characters are sent to query a list of thousands of possible matching hashes, and the final match is determined locally on your machine.
          </p>
        </div>

        <form onSubmit={handleCheck} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to verify against data breaches..."
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

          <button
            type="submit"
            disabled={isLoading || !password}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Hashing...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Check Exposure</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && !result.error && (
        <div
          className={`${styles.resultCard} ${
            result.count > 0 ? styles.resultCardPwned : styles.resultCardClean
          }`}
        >
          {result.count > 0 ? (
            <>
              <div className={`${styles.resultIconBox} ${styles.resultIconBoxPwned}`}>
                <AlertTriangle size={32} />
              </div>
              <span className={`${styles.resultBadge} ${styles.resultBadgePwned}`}>
                CRITICAL EXPOSURE
              </span>
              <h4 className={styles.resultTitle}>
                Compromised in Known Breaches
              </h4>
              <p className={styles.resultText}>
                This password has appeared{" "}
                <span className={styles.resultCount}>
                  {result.count.toLocaleString()}
                </span>{" "}
                times in public breach corpuses and credential dumps.
              </p>
              <div className={`${styles.calloutBox} ${styles.calloutPwned}`}>
                <strong>Immediate Action Required:</strong> Never use this password for any account. Automated botnets actively cycle through these lists in credential-stuffing attacks.
              </div>
            </>
          ) : (
            <>
              <div className={`${styles.resultIconBox} ${styles.resultIconBoxClean}`}>
                <ShieldCheck size={32} />
              </div>
              <span className={`${styles.resultBadge} ${styles.resultBadgeClean}`}>
                NO BREACH RECORD
              </span>
              <h4 className={styles.resultTitle}>
                Good News — Zero Exposures Found
              </h4>
              <p className={styles.resultText}>
                This password was not found in any indexed public data breaches or paste dumps.
              </p>
              <div className={`${styles.calloutBox} ${styles.calloutClean}`}>
                <strong className={styles.highlightYellow}>Security Best Practice:</strong> Even unbreached passwords should be unique across all services. Always use a password manager with 16+ characters.
              </div>
            </>
          )}
        </div>
      )}

      {result?.error && (
        <div className={styles.errorBanner}>
          <AlertTriangle className={styles.errorIcon} size={20} />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}
