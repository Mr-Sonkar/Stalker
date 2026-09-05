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
} from "lucide-react";
import { ScanReport } from "@/lib/scanner/types";

interface ScanResultViewProps {
  report: ScanReport;
  scanDbId?: string;
  onReset: () => void;
}

export function ScanResultView({ report, scanDbId, onReset }: ScanResultViewProps) {
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
    <div className="animate-in fade-in zoom-in-95 w-full max-w-3xl space-y-6 text-left duration-300">
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
              onClick={onReset}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
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
                className={`font-mono text-2xl font-black ${
                  report.riskScore > 50
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

        {/* Database Persistence Status Pill */}
        {scanDbId && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/30 px-4 py-2 text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>Saved to Prisma SQLite (`dev.db`)</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">ID: {scanDbId}</span>
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
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        dc.toLowerCase().includes("password")
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
