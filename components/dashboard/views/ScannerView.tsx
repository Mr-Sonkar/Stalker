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
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  FileSearch,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ScanReport } from "@/lib/scanner/types";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import styles from "./ScannerView.module.css";

export function ScannerView() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bioText, setBioText] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanData, setScanData] = useState<{
    report: ScanReport;
    scanId: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("scan-report-container");
    if (!reportElement) return;

    try {
      setIsExporting(true);

      const imgData = await toPng(reportElement, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.classList.contains("html2canvas-ignore");
          }
          return true;
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const reportWidth = reportElement.offsetWidth;
      const reportHeight = reportElement.offsetHeight;
      const pdfHeight = (reportHeight * pdfWidth) / reportWidth;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const targetName = scanData?.report.target || "Dossier";
      pdf.save(`Privacy_Audit_Report_${targetName}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const hasPayload = Boolean(query.trim() || file || bioText.trim() || screenshot);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Multi-Vector Reconnaissance
        </div>
        <h1 className={styles.title}>
          Multi-Vector <span className={styles.titleAccent}>Privacy Scanner</span>
        </h1>
        <p className={styles.subtitle}>
          Correlate digital footprint exposure across public databases, EXIF metadata, OCR image text, and social biographies with zero telemetry retention.
        </p>
      </div>

      {!scanData ? (
        /* Input Form */
        <div className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              <Search size={16} />
              <span>Primary Vector: Email / Identity</span>
            </span>
            <span className={styles.badgeMono}>Target Endpoint</span>
          </div>

          <form onSubmit={handleFormSubmit} className={styles.scannerForm}>
            <div className={styles.inputGroup}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="email"
                className={styles.input}
                placeholder="Enter email to scan breaches & dark web dumps..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </div>

            <div className={styles.vectorsGrid}>
              {/* Vector: File Metadata */}
              <div className={`${styles.vectorCard} ${file ? styles.vectorCardActive : ""}`}>
                <div className={styles.vectorTitle}>
                  <FileText size={16} color="var(--brand-cyan)" />
                  <span>Document / EXIF</span>
                </div>
                <p className={styles.vectorDesc}>
                  Inspect hidden author records, timestamps, GPS, or camera hardware in PDF, DOCX, or images.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,image/*"
                  className={styles.hiddenInput}
                />
                {file ? (
                  <div className={styles.fileIndicator}>
                    <span className={styles.fileNameText}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => setFile(null)}
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
                <div className={styles.vectorTitle}>
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
                  <div className={styles.fileIndicator}>
                    <span className={styles.fileNameText}>
                      {screenshot.name}
                    </span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => setScreenshot(null)}
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
                <div className={styles.vectorTitle}>
                  <Sparkles size={16} color="var(--brand-chartreuse)" />
                  <span>Profile Bio / Text</span>
                </div>
                <p className={styles.vectorDesc}>
                  Parse social media bios or snippets to detect accidental disclosure of locations and aliases.
                </p>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste bio snippet or profile summary..."
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                />
              </div>
            </div>

            {errorMessage && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.actionRow}>
              <button
                type="submit"
                disabled={isScanning || !hasPayload}
                className={styles.submitBtn}
              >
                {isScanning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Executing Reconnaissance...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Launch Comprehensive Audit</span>
                  </>
                )}
              </button>

              {hasPayload && !isScanning && (
                <button
                  type="button"
                  onClick={handleReset}
                  className={styles.clearBtn}
                >
                  <RotateCcw size={14} />
                  <span>Clear All Vectors</span>
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Results View */
        <div id="scan-report-container" className={styles.resultsContainer}>
          <div className={styles.resultHeroCard}>
            <div className={styles.resultHeroTop}>
              <div>
                <span className={styles.targetLabel}>Target Scanned</span>
                <div className={styles.targetHeading}>{scanData.report.target}</div>
              </div>

              <div className={styles.resultActions}>
                <div
                  className={`${styles.threatBadge} ${
                    scanData.report.threatLevel === "CLEAN"
                      ? styles.threatClean
                      : scanData.report.threatLevel === "LOW"
                      ? styles.threatLow
                      : scanData.report.threatLevel === "MODERATE"
                      ? styles.threatModerate
                      : scanData.report.threatLevel === "HIGH"
                      ? styles.threatHigh
                      : styles.threatCritical
                  }`}
                >
                  {scanData.report.threatLevel === "CLEAN" ? (
                    <ShieldCheck size={16} />
                  ) : scanData.report.threatLevel === "LOW" ? (
                    <ShieldCheck size={16} />
                  ) : scanData.report.threatLevel === "MODERATE" ? (
                    <AlertTriangle size={16} />
                  ) : scanData.report.threatLevel === "HIGH" ? (
                    <ShieldAlert size={16} />
                  ) : (
                    <Flame size={16} />
                  )}
                  <span>{scanData.report.threatLevel} RISK</span>
                </div>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className={`${styles.exportBtn} html2canvas-ignore`}
                >
                  <Download size={14} />
                  <span>{isExporting ? "Generating..." : "Export PDF"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className={`${styles.clearBtn} html2canvas-ignore`}
                >
                  <RotateCcw size={14} />
                  <span>New Scan</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className={styles.statsGrid}>
              <div className={styles.statTile}>
                <span className={styles.statTileLabel}>Threat Index</span>
                <span
                  className={`${styles.statTileVal} ${
                    scanData.report.riskScore > 50
                      ? styles.statTileValCritical
                      : scanData.report.riskScore > 20
                      ? styles.statTileValModerate
                      : styles.statTileValClean
                  }`}
                >
                  {scanData.report.riskScore} / 100
                </span>
              </div>
              <div className={styles.statTile}>
                <span className={styles.statTileLabel}>Known Breaches</span>
                <span className={styles.statTileVal}>{scanData.report.breaches.length}</span>
              </div>
              <div className={styles.statTile}>
                <span className={styles.statTileLabel}>Exposed Data Types</span>
                <span className={`${styles.statTileVal} ${styles.statTileValYellow}`}>
                  {scanData.report.summary.exposedDataClasses.length}
                </span>
              </div>
              <div className={styles.statTile}>
                <span className={styles.statTileLabel}>OSINT Signals</span>
                <span className={`${styles.statTileVal} ${styles.statTileValCyan}`}>
                  {scanData.report.accountExposures.length}
                </span>
              </div>
            </div>
          </div>

          {/* Breach Findings */}
          {scanData.report.breaches.length > 0 && (
            <div className={styles.findingsCard}>
              <div className={styles.findingsHeader}>
                <ShieldAlert size={18} color="#ef4444" />
                <span>Breach Findings ({scanData.report.breaches.length})</span>
                {scanData.report.summary.providerBreakdown && (
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "auto", fontWeight: 500 }}>
                    HIBP: {scanData.report.summary.providerBreakdown.hibpCount} • XON: {scanData.report.summary.providerBreakdown.xonCount} • Dual-Confirmed: {scanData.report.summary.providerBreakdown.verifiedByBoth}
                  </span>
                )}
              </div>
              <div className={styles.findingsList}>
                {scanData.report.breaches.map((breach, idx) => (
                  <div key={idx} className={styles.findingItem}>
                    <div className={styles.findingItemHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span className={styles.findingName}>
                          {breach.name} ({breach.domain})
                        </span>
                        {breach.sources && breach.sources.length > 0 && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            {breach.sources.map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: s === "HIBP" ? "rgba(6, 182, 212, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                  color: s === "HIBP" ? "#38bdf8" : "#34d399",
                                  border: `1px solid ${s === "HIBP" ? "rgba(6, 182, 212, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={styles.findingMeta}>
                        Date: {breach.breachDate} • {breach.pwnCount?.toLocaleString()} victims
                      </span>
                    </div>
                    <p className={styles.findingDesc}>{breach.description}</p>
                    <div className={styles.dataPillRow}>
                      {breach.dataClasses.map((dc, i) => (
                        <span
                          key={i}
                          className={`${styles.dataTag} ${
                            dc.toLowerCase().includes("password") ? styles.dataTagPassword : ""
                          }`}
                        >
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Findings */}
          {scanData.report.metadataFindings && scanData.report.metadataFindings.length > 0 && (
            <div className={styles.findingsCard}>
              <div className={styles.findingsHeader}>
                <FileSearch size={18} color="var(--brand-cyan)" />
                <span>File Metadata Findings</span>
              </div>
              <div className={styles.findingsList}>
                {scanData.report.metadataFindings.map((finding, idx) => (
                  <div key={idx} className={styles.findingItem}>
                    <div className={styles.findingItemHeader}>
                      <span className={styles.findingName}>{finding.fileName}</span>
                      <span className={styles.findingMeta}>Type: {finding.fileType}</span>
                    </div>
                    <div className={styles.metadataGrid}>
                      {finding.findings.map((item, i) => (
                        <div key={i} className={styles.metadataTile}>
                          <div className={styles.metadataLabel}>
                            {item.label}
                          </div>
                          <div className={styles.metadataValue}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Text & OCR Findings */}
          {scanData.report.profileTextFindings && scanData.report.profileTextFindings.length > 0 && (
            <div className={styles.findingsCard}>
              <div className={styles.findingsHeader}>
                <Sparkles size={18} color="var(--brand-chartreuse)" />
                <span>Text &amp; OCR PII Analysis ({scanData.report.profileTextFindings.length})</span>
              </div>
              <div className={styles.findingsList}>
                {scanData.report.profileTextFindings.map((finding, idx) => (
                  <div key={idx} className={styles.findingItem}>
                    <div className={styles.findingItemHeader}>
                      <span className={styles.findingName}>
                        {finding.source.toUpperCase()}: {finding.piiType.toUpperCase()}
                      </span>
                      <span className={styles.findingMeta}>
                        Risk: {finding.riskLevel} • {Math.round(finding.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <div className={styles.ocrSnippet}>
                      {finding.matchedText}
                    </div>
                    <p className={styles.findingDesc}>{finding.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
