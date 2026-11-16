import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Key,
  Globe,
  FileSearch,
  Download,
  RotateCcw,
} from "lucide-react";
import { ScanReport } from "@/lib/scanner/types";
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
        backgroundColor: "#03080e",
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
          bg: "bg-[#169b5c]/10 border-[#169b5c]/30 text-[#169b5c]",
          icon: ShieldCheck,
          label: "Clean — No Critical Leaks",
        };
      case "LOW":
        return {
          bg: "bg-[#2ca6e9]/10 border-[#2ca6e9]/30 text-[#2ca6e9]",
          icon: ShieldCheck,
          label: "Low Risk Exposure",
        };
      case "MODERATE":
        return {
          bg: "bg-[#e0e260]/10 border-[#e0e260]/30 text-[#e0e260]",
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
    <div id="scan-report" className="animate-in fade-in zoom-in-95 w-full max-w-4xl space-y-6 text-left duration-300">
      {/* Top Banner Card */}
      <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#2ca6e9]/15 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs text-slate-400">Target Scanned</span>
            <h2 className="mt-0.5 font-mono text-xl font-bold text-[#fafeff] sm:text-2xl">
              {report.target}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${badge.bg}`}
            >
              <BadgeIcon className="h-4 w-4" />
              <span>{badge.label}</span>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="html2canvas-ignore inline-flex items-center gap-1.5 rounded-xl border border-[#169b5c]/30 bg-[#169b5c]/10 px-3.5 py-1.5 text-xs font-semibold text-[#169b5c] transition-all hover:bg-[#169b5c]/20 hover:text-[#e0e260] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
            </button>
            <button
              onClick={onReset}
              className="html2canvas-ignore inline-flex items-center gap-1.5 rounded-xl border border-[#2ca6e9]/20 bg-[#071927] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-[#16364a] hover:text-[#fafeff]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Risk Score & Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-4">
            <span className="text-xs text-slate-400">Threat Score</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`font-mono text-3xl font-black ${
                  report.riskScore > 50
                    ? "text-red-400"
                    : report.riskScore > 20
                      ? "text-[#e0e260]"
                      : "text-[#169b5c]"
                }`}
              >
                {report.riskScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-4">
            <span className="text-xs text-slate-400">Known Breaches</span>
            <div className="mt-1 font-mono text-3xl font-black text-[#fafeff]">
              {report.breaches.length}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-4">
            <span className="text-xs text-slate-400">Exposed Data Types</span>
            <div className="mt-1 font-mono text-3xl font-black text-[#e0e260]">
              {report.summary.exposedDataClasses.length}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-4">
            <span className="text-xs text-slate-400">OSINT Discoveries</span>
            <div className="mt-1 font-mono text-3xl font-black text-[#2ca6e9]">
              {report.accountExposures.length}
            </div>
          </div>
        </div>

        {/* Zero-Knowledge Privacy Status Pill */}
        {scanDbId && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#169b5c]/25 bg-[#169b5c]/10 px-4 py-2 text-xs text-[#169b5c]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#169b5c]" />
              <span className="text-[#fafeff]">Zero-Knowledge Mode: Processed in-memory (No database logs retained)</span>
            </div>
            <span className="font-mono text-[11px] text-[#e0e260]">Ref: {scanDbId}</span>
          </div>
        )}
      </div>

      {/* Breaches List */}
      {report.breaches.length > 0 && (
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-bold text-[#fafeff]">
              Breach Findings ({report.breaches.length})
            </h3>
          </div>

          <div className="space-y-4">
            {report.breaches.map((breach, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4 transition-all hover:border-[#2ca6e9]/35"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-[#fafeff]">
                      <span>{breach.name}</span>
                      <span className="font-mono text-xs font-normal text-slate-400">
                        ({breach.domain})
                      </span>
                    </h4>
                    <span className="text-xs text-[#e0e260]">
                      Breach Date: {breach.breachDate}
                    </span>
                  </div>

                  {breach.pwnCount && (
                    <span className="rounded-full border border-[#2ca6e9]/20 bg-[#071927] px-2.5 py-0.5 font-mono text-xs text-[#2ca6e9]">
                      {breach.pwnCount.toLocaleString()} victims
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {breach.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {breach.dataClasses.map((dc, i) => (
                    <span
                      key={i}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        dc.toLowerCase().includes("password")
                          ? "border border-red-500/30 bg-red-500/10 text-red-300"
                          : "border border-[#2ca6e9]/20 bg-[#071927] text-slate-300"
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
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#2ca6e9]" />
            <h3 className="text-lg font-bold text-[#fafeff]">Public Account Exposure</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.accountExposures.map((acc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4"
              >
                {acc.avatarUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={acc.avatarUrl}
                    alt={acc.platform}
                    className="h-12 w-12 rounded-xl border border-[#2ca6e9]/20 bg-[#071927] object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#fafeff]">
                      {acc.platform}
                    </h4>
                    {acc.profileUrl && (
                      <a
                        href={acc.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2ca6e9] hover:text-[#e0e260]"
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
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#e0e260]" />
            <h3 className="text-lg font-bold text-[#fafeff]">Paste Site Exposures</h3>
          </div>

          <div className="space-y-4">
            {report.pasteFindings.map((paste, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4 transition-all hover:border-[#2ca6e9]/35"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-[#fafeff]">
                      <span>{paste.title}</span>
                      <span className="font-mono text-xs font-normal text-slate-400">
                        ({paste.source})
                      </span>
                    </h4>
                    <span className="text-xs text-[#e0e260]">
                      Date: {paste.date}
                    </span>
                  </div>

                  <div className="rounded-full border border-[#2ca6e9]/20 bg-[#071927] px-2.5 py-0.5 font-mono text-xs text-[#2ca6e9]">
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
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#2ca6e9]" />
            <h3 className="text-lg font-bold text-[#fafeff]">File Metadata Findings</h3>
          </div>

          <div className="space-y-4">
            {report.metadataFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4 transition-all hover:border-[#2ca6e9]/35"
              >
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-[#fafeff]">
                      <span>{finding.fileName}</span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      Type: {finding.fileType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {finding.findings.map((item, i) => (
                    <div key={i} className="rounded-xl border border-[#2ca6e9]/15 bg-[#071927]/60 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{item.label}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.riskLevel === 'MODERATE'
                              ? 'bg-[#e0e260]/10 text-[#e0e260] border border-[#e0e260]/20'
                              : 'bg-[#169b5c]/10 text-[#169b5c] border border-[#169b5c]/20'
                          }`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#fafeff] break-words">{item.value}</p>
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
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#e0e260]" />
            <h3 className="text-lg font-bold text-[#fafeff]">Potentially Exposed Profile Intelligence</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.profileTextFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4 transition-all hover:border-[#2ca6e9]/35 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#e0e260]">{finding.piiType}</span>
                    <span className="text-[10px] text-slate-400 bg-[#071927] px-1.5 py-0.5 rounded border border-[#2ca6e9]/20">
                      via {finding.source}
                    </span>
                  </div>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${finding.riskLevel === 'HIGH' || finding.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : finding.riskLevel === 'MODERATE'
                        ? 'bg-[#e0e260]/10 text-[#e0e260] border border-[#e0e260]/20'
                        : 'bg-[#169b5c]/10 text-[#169b5c] border border-[#169b5c]/20'
                    }`}>
                    {finding.riskLevel}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-[#fafeff] break-words">{finding.matchedText}</p>
                <p className="mt-2 text-xs text-slate-400">{finding.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-[#169b5c]" />
          <h3 className="text-lg font-bold text-[#fafeff]">Privacy Recommendations</h3>
        </div>

        <ul className="space-y-2.5">
          {report.recommendations.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-3 text-xs text-slate-300 sm:text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#169b5c]" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
