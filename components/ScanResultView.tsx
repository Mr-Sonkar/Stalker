import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
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
import styles from "./ScanResultView.module.css";

interface ScanResultViewProps {
  report: ScanReport;
  scanDbId?: string;
  onReset: () => void;
}

export function ScanResultView({ report, onReset }: ScanResultViewProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("scan-report");
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

      pdf.save(`Privacy_Audit_Report_${report.target}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const threatClass =
    report.threatLevel === "CLEAN"
      ? styles.threatClean
      : report.threatLevel === "LOW"
      ? styles.threatLow
      : report.threatLevel === "MODERATE"
      ? styles.threatModerate
      : report.threatLevel === "HIGH"
      ? styles.threatHigh
      : styles.threatCritical;

  return (
    <div className={styles.container} id="scan-report">
      {/* Hero Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div>
            <span className={styles.targetLabel}>Target Scanned</span>
            <div className={styles.targetHeading}>{report.target}</div>
          </div>

          <div className={styles.resultActions}>
            <div className={`${styles.threatBadge} ${threatClass}`}>
              {report.threatLevel === "CLEAN" ? (
                <ShieldCheck size={16} />
              ) : report.threatLevel === "LOW" ? (
                <ShieldCheck size={16} />
              ) : report.threatLevel === "MODERATE" ? (
                <AlertTriangle size={16} />
              ) : report.threatLevel === "HIGH" ? (
                <ShieldAlert size={16} />
              ) : (
                <Flame size={16} />
              )}
              <span>{report.threatLevel} RISK</span>
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
              onClick={onReset}
              className={`${styles.clearBtn} html2canvas-ignore`}
            >
              <RotateCcw size={14} />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statTile}>
            <span className={styles.statTileLabel}>Threat Index</span>
            <span className={styles.statTileVal}>
              {report.riskScore} / 100
            </span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statTileLabel}>Known Breaches</span>
            <span className={styles.statTileVal}>{report.breaches.length}</span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statTileLabel}>Exposed Data Types</span>
            <span className={`${styles.statTileVal} ${styles.threatModerate}`}>
              {report.summary.exposedDataClasses.length}
            </span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statTileLabel}>OSINT Signals</span>
            <span className={`${styles.statTileVal} ${styles.threatLow}`}>
              {report.accountExposures.length}
            </span>
          </div>
        </div>
      </div>

      {/* Breach Findings */}
      {report.breaches.length > 0 && (
        <div className={styles.findingsCard}>
          <div className={styles.findingsHeader}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>Breach Findings ({report.breaches.length})</span>
          </div>
          <div className={styles.findingsList}>
            {report.breaches.map((breach, idx) => (
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
      {report.metadataFindings && report.metadataFindings.length > 0 && (
        <div className={styles.findingsCard}>
          <div className={styles.findingsHeader}>
            <FileSearch size={18} color="var(--brand-cyan)" />
            <span>File Metadata Findings</span>
          </div>
          <div className={styles.findingsList}>
            {report.metadataFindings.map((finding, idx) => (
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
      {report.profileTextFindings && report.profileTextFindings.length > 0 && (
        <div className={styles.findingsCard}>
          <div className={styles.findingsHeader}>
            <Sparkles size={18} color="var(--brand-chartreuse)" />
            <span>Text &amp; OCR PII Analysis ({report.profileTextFindings.length})</span>
          </div>
          <div className={styles.findingsList}>
            {report.profileTextFindings.map((finding, idx) => (
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
  );
}
