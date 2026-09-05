"use client";

import React, { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { ScanResultView } from "./ScanResultView";
import { ScanReport } from "@/lib/scanner/types";

export function ScanForm() {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanData, setScanData] = useState<{
    report: ScanReport;
    scanId: string;
  } | null>(null);

  const executeScan = async (target: string) => {
    const trimmed = target.trim();
    if (!trimmed || isScanning) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
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
    executeScan(query);
  };

  const handleReset = () => {
    setScanData(null);
    setQuery("");
    setErrorMessage(null);
  };

  if (scanData) {
    return (
      <div className="mx-auto mt-8 flex justify-center">
        <ScanResultView
          report={scanData.report}
          scanDbId={scanData.scanId}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <form onSubmit={handleFormSubmit}>
        <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Search className="ml-3 h-5 w-5 text-slate-400" />
          <input
            type="email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Enter your email to audit (e.g., name@domain.com)..."
            className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={!query.trim() || isScanning}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <span>Scan Now</span>
            )}
          </button>
        </div>
      </form>

      {/* Quick Test Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span>Try sample:</span>
        <button
          type="button"
          onClick={() => {
            setQuery("test.breach@example.com");
            executeScan("test.breach@example.com");
          }}
          className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
        >
          test.breach@example.com
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("alex.pwned@admin.com");
            executeScan("alex.pwned@admin.com");
          }}
          className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
        >
          alex.pwned@admin.com
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/30 p-3.5 text-left text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        🔒 Scans are executed server-side. Results are safely stored in your local Prisma
        database.
      </p>
    </div>
  );
}
