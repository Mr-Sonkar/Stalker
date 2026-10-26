import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Key,
  Globe,
  Database,
  FileSearch,
} from "lucide-react";
import { ScanReport } from "@/lib/scanner/types";
import { useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

interface ScanResultViewProps {
  report: ScanReport;
  scanDbId?: string;
  onReset: () => void;
}

export function ScanResultView({ report, scanDbId, onReset }: ScanResultViewProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("scan-report");
    if (!reportElement) return;

    try {
      setIsExporting(true);

      const imgData = await toPng(reportElement, {
        pixelRatio: 2,
        backgroundColor: "#020617",
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.classList.contains("html2canvas-ignore");
          }
          return true;
        }
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

      // Handle multi-page reports
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

      pdf.save(`Privacy_Scan_Report_${report.target}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  const getThreatBadge = () => {
    switch (report.threatLevel) {
      case "CLEAN":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: ShieldCheck,
          label: "Clean — No Critical Leaks",
        };
      case "LOW":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          icon: ShieldCheck,
          label: "Low Risk",
        };
      case "MODERATE":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
          icon: AlertTriangle,
          label: "Moderate Exposure",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
          icon: ShieldAlert,
          label: "High Risk Leak Detected",
        };
      case "CRITICAL":
        return {
          bg: "bg-red-500/15 border-red-500/40 text-red-400",
          icon: Flame,
          label: "Critical Breach Exposure",
        };
    }
  };

  const badge = getThreatBadge();
  const BadgeIcon = badge.icon;

  return (
    <div id="scan-report" className="animate-in fade-in zoom-in-95 w-full max-w-3xl space-y-6 text-left duration-300">
      {/* Top Banner Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs text-slate-400">Target Scanned</span>
            <h2 className="mt-0.5 font-mono text-xl font-bold text-white sm:text-2xl">
              {report.target}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${badge.bg}`}
            >
              <BadgeIcon className="h-4 w-4" />
              <span>{badge.label}</span>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="html2canvas-ignore rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-all hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? "Exporting..." : "Download PDF"}
            </button>
            <button
              onClick={onReset}
              className="html2canvas-ignore rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
            >
              New Scan
            </button>
          </div>
        </div>

        {/* Risk Score & Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-xs text-slate-400">Threat Score</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`font-mono text-2xl font-black ${report.riskScore > 50
                    ? "text-red-400"
                    : report.riskScore > 20
                      ? "text-yellow-400"
                      : "text-emerald-400"
                  }`}
              >
                {report.riskScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-xs text-slate-400">Known Breaches</span>
            <div className="mt-1 font-mono text-2xl font-black text-white">
              {report.breaches.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-xs text-slate-400">Exposed Data Types</span>
            <div className="mt-1 font-mono text-2xl font-black text-cyan-400">
              {report.summary.exposedDataClasses.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-xs text-slate-400">OSINT Discoveries</span>
            <div className="mt-1 font-mono text-2xl font-black text-indigo-400">
              {report.accountExposures.length}
            </div>
          </div>
        </div>

        {/* Zero-Knowledge Privacy Status Pill */}
        {scanDbId && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-2 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Knowledge Mode: Processed in-memory (No database logs retained)</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Ref: {scanDbId}</span>
          </div>
        )}
      </div>

      {/* Breaches List */}
      {report.breaches.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">
              Breach Findings ({report.breaches.length})
            </h3>
          </div>

          <div className="space-y-4">
            {report.breaches.map((breach, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-100">
                      <span>{breach.name}</span>
                      <span className="font-mono text-xs font-normal text-slate-400">
                        ({breach.domain})
                      </span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Breach Date: {breach.breachDate}
                    </span>
                  </div>

                  {breach.pwnCount && (
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-slate-300">
                      {breach.pwnCount.toLocaleString()} victims
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {breach.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {breach.dataClasses.map((dc, i) => (
                    <span
                      key={i}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${dc.toLowerCase().includes("password")
                          ? "border border-red-500/30 bg-red-500/10 text-red-300"
                          : "border border-slate-800 bg-slate-900 text-slate-300"
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

      {/* OSINT & Public Footprint */}
      {report.accountExposures.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Public Account Exposure</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.accountExposures.map((acc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
              >
                {acc.avatarUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={acc.avatarUrl}
                    alt={acc.platform}
                    className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900 object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-100">
                      {acc.platform}
                    </h4>
                    {acc.profileUrl && (
                      <a
                        href={acc.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-normal text-slate-400">
                    {acc.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paste Site Exposures */}
      {report.pasteFindings && report.pasteFindings.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Paste Site Exposures</h3>
          </div>

          <div className="space-y-4">
            {report.pasteFindings.map((paste, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-100">
                      <span>{paste.title}</span>
                      <span className="font-mono text-xs font-normal text-slate-400">
                        ({paste.source})
                      </span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Date: {paste.date}
                    </span>
                  </div>

                  <div className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-slate-300">
                    {paste.emailCount.toLocaleString()} emails exposed
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  This email address appeared in a public paste site, which may indicate a credential leak or data dump.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Metadata Findings */}
      {report.metadataFindings && report.metadataFindings.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-fuchsia-400" />
            <h3 className="text-lg font-bold text-white">File Metadata Findings</h3>
          </div>

          <div className="space-y-4">
            {report.metadataFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
              >
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-100">
                      <span>{finding.fileName}</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Type: {finding.fileType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {finding.findings.map((item, i) => (
                    <div key={i} className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{item.label}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.riskLevel === 'MODERATE'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300 break-words">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Text (OCR & Bio) Findings */}
      {report.profileTextFindings && report.profileTextFindings.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Potentially exposed information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.profileTextFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{finding.piiType}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      via {finding.source}
                    </span>
                  </div>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${finding.riskLevel === 'HIGH' || finding.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : finding.riskLevel === 'MODERATE'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                    {finding.riskLevel}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-white break-words">{finding.matchedText}</p>
                <p className="mt-2 text-xs text-slate-400">{finding.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Privacy Recommendations</h3>
        </div>

        <ul className="space-y-2.5">
          {report.recommendations.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-300 sm:text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
