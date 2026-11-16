"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Shield,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { ScanResultView } from "./ScanResultView";
import { ScanReport } from "@/lib/scanner/types";
import { PasswordStrength } from "./PasswordStrength";
import styles from "./ScanForm.module.css";

export function ScanForm() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bioText, setBioText] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [showPasswordChecker, setShowPasswordChecker] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanData, setScanData] = useState<{
    report: ScanReport;
    scanId: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const executeScan = async (
    target: string,
    selectedFile?: File | null,
    bioData?: string,
    selectedScreenshot?: File | null
  ) => {
    const trimmed = target.trim();
    if ((!trimmed && !selectedFile && !bioData && !selectedScreenshot) || isScanning) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", trimmed);
      if (selectedFile) formData.append("file", selectedFile);
      if (bioData) formData.append("bioText", bioData);
      if (selectedScreenshot) formData.append("screenshot", selectedScreenshot);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to execute privacy scan.");
      }

      setScanData({
        report: data.report,
        scanId: data.scanId,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error?.message || "An error occurred while connecting to the scanning engine."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(query, file, bioText, screenshot);
  };

  const handleReset = () => {
    setScanData(null);
    setQuery("");
    setFile(null);
    setBioText("");
    setScreenshot(null);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage("File exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage("Screenshot exceeds 10MB limit.");
        return;
      }
      setScreenshot(selected);
      setErrorMessage(null);
    }
  };

  if (scanData) {
    return (
      <ScanResultView
        report={scanData.report}
        scanDbId={scanData.scanId}
        onReset={handleReset}
      />
    );
  }

  const hasPayload = Boolean(query.trim() || file || bioText.trim() || screenshot);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}>
              <Search size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Multi-Vector Privacy Reconnaissance</h3>
              <p className={styles.subtitle}>
                Scan dark web dumps, EXIF document properties, and social bios
              </p>
            </div>
          </div>
          <span className={styles.badge}>
            Zero-Knowledge Scanner
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Primary Vector: Identity / Email
            </label>
            <div className={styles.inputWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="email"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter email to scan breaches & dark web dumps..."
                className={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.vectorsGrid}>
            {/* Vector: File Metadata */}
            <div className={`${styles.vectorCard} ${file ? styles.vectorCardActive : ""}`}>
              <div className={styles.vectorHeader}>
                <FileText size={16} color="var(--brand-cyan)" />
                <span>Document / EXIF</span>
              </div>
              <p className={styles.vectorDesc}>
                Inspect author records, software properties, GPS, or camera hardware in PDF, DOCX, or images.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,image/*"
                className={styles.hiddenInput}
              />
              {file ? (
                <div className={styles.fileBadge}>
                  <span className={styles.fileName}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className={styles.removeFileBtn}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.uploadBtn}
                >
                  <UploadCloud size={14} />
                  <span>Upload Document</span>
                </button>
              )}
            </div>

            {/* Vector: OCR Screenshot */}
            <div className={`${styles.vectorCard} ${screenshot ? styles.vectorCardActive : ""}`}>
              <div className={styles.vectorHeader}>
                <ImageIcon size={16} color="var(--brand-emerald)" />
                <span>OCR Screenshot</span>
              </div>
              <p className={styles.vectorDesc}>
                Extract and analyze embedded PII, email handles, and phone numbers from raw screenshots.
              </p>
              <input
                type="file"
                ref={screenshotInputRef}
                onChange={handleScreenshotChange}
                accept="image/*"
                className={styles.hiddenInput}
              />
              {screenshot ? (
                <div className={styles.fileBadge}>
                  <span className={styles.fileName}>{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className={styles.removeFileBtn}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  className={styles.uploadBtn}
                >
                  <UploadCloud size={14} />
                  <span>Upload Screenshot</span>
                </button>
              )}
            </div>

            {/* Vector: Bio / Raw Text */}
            <div className={`${styles.vectorCard} ${bioText ? styles.vectorCardActive : ""}`}>
              <div className={styles.vectorHeader}>
                <Sparkles size={16} color="var(--brand-chartreuse)" />
                <span>Profile Bio / Text</span>
              </div>
              <p className={styles.vectorDesc}>
                Parse social media bios or snippets to detect accidental disclosure of locations and aliases.
              </p>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Paste bio snippet or profile summary..."
                className={styles.textarea}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isScanning || !hasPayload}
            className={styles.submitBtn}
          >
            {isScanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Executing In-Memory Reconnaissance...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Launch Complete Privacy Audit</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className={styles.errorBanner}>
              <AlertCircle className={styles.errorIcon} size={16} />
              <span className={styles.errorText}>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className={styles.removeFileBtn}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Password Strength Drawer Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPasswordChecker(!showPasswordChecker)}
              className={styles.drawerToggle}
            >
              <span className={styles.drawerTitleGroup}>
                <KeyRound size={14} color="var(--brand-cyan)" />
                <span>Check Password Entropy (Local k-Anonymity)</span>
              </span>
              <ChevronDown
                size={16}
                className={`${styles.drawerArrow} ${
                  showPasswordChecker ? styles.drawerArrowOpen : ""
                }`}
              />
            </button>

            {showPasswordChecker && (
              <div className={styles.drawerContainer}>
                <PasswordStrength />
              </div>
            )}
          </div>

          {/* Privacy Assurance Footer Note */}
          <div className={styles.footerNote}>
            <Shield size={14} color="var(--brand-emerald)" />
            <span>Strict zero-knowledge policy: Scans are processed ephemerally in-memory.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
