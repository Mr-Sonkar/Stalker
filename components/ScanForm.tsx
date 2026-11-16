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
  FileSearch,
} from "lucide-react";
import { ScanResultView } from "./ScanResultView";
import { ScanReport } from "@/lib/scanner/types";
import { PasswordStrength } from "./PasswordStrength";

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
      <div className="mx-auto mt-8 flex justify-center">
        <ScanResultView
          report={scanData.report}
          scanDbId={scanData.scanId}
          onReset={handleReset}
        />
      </div>
    );
  }

  const hasPayload = Boolean(query.trim() || file || bioText.trim() || screenshot);

  return (
    <div id="scanner" className="mx-auto mt-10 max-w-2xl text-left">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Main Intelligence Input Card */}
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/85 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between border-b border-[#2ca6e9]/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#169b5c] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#fafeff]">
                Primary Identity Vector
              </span>
            </div>
            <span className="text-[11px] text-[#e0e260] font-mono">Input: Email / Account</span>
          </div>

          {/* Email input field */}
          <div className="relative flex items-center rounded-2xl border border-[#2ca6e9]/20 bg-[#030912]/90 p-2 shadow-inner transition-all focus-within:border-[#2ca6e9] focus-within:ring-2 focus-within:ring-[#2ca6e9]/20">
            <Search className="ml-3 h-5 w-5 text-[#2ca6e9] shrink-0" />
            <input
              type="email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter email to scan for breaches & dark web dumps..."
              className="w-full bg-transparent px-3 py-2 text-sm text-[#fafeff] placeholder-slate-500 focus:outline-none"
              autoComplete="email"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mr-2 rounded-full p-1 text-slate-400 hover:bg-[#071927] hover:text-[#fafeff]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Sample Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px] text-slate-400">Quick tests:</span>
            <button
              type="button"
              onClick={() => {
                setQuery("test.breach@example.com");
                executeScan("test.breach@example.com");
              }}
              className="rounded-lg border border-[#2ca6e9]/25 bg-[#030912] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-[#169b5c] hover:text-[#e0e260]"
            >
              test.breach@example.com
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("account-exists@hibp-integration-tests.com");
              }}
              className="rounded-lg border border-[#2ca6e9]/25 bg-[#030912] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-[#2ca6e9] hover:text-[#fafeff]"
            >
              account-exists@hibp...
            </button>
          </div>
        </div>

        {/* Secondary Scan Vectors */}
        <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/70 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-3">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-[#2ca6e9]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#fafeff]">
                Additional Exposure Vectors (Optional)
              </span>
            </div>
            <span className="text-[11px] text-[#e0e260] font-mono">Metadata & OCR</span>
          </div>

          {/* Social Bio Scanner */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <FileText className="h-3.5 w-3.5 text-[#2ca6e9]" />
              <span>Bio Text Analysis (PII, Phone Numbers & Location Leak Check)</span>
            </label>
            <div className="relative rounded-2xl border border-[#2ca6e9]/20 bg-[#030912]/80 p-3 transition-all focus-within:border-[#2ca6e9] focus-within:ring-2 focus-within:ring-[#2ca6e9]/20">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Paste social profile bio or text snippet to detect accidental leaks..."
                className="w-full bg-transparent text-xs text-[#fafeff] placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                rows={2}
              />
              {bioText && (
                <div className="flex justify-end pt-1">
                  <span className="text-[10px] text-[#e0e260] font-mono">
                    {bioText.length} characters
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Dropzone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* File Metadata Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border border-dashed p-4 text-center cursor-pointer transition-all ${
                file
                  ? "border-[#169b5c]/60 bg-[#169b5c]/10"
                  : "border-[#2ca6e9]/25 bg-[#030912]/60 hover:border-[#169b5c]/50 hover:bg-[#071927]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate text-left">
                    <UploadCloud className="h-4 w-4 text-[#169b5c] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#fafeff] truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-full bg-[#071927] p-1 text-slate-400 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <UploadCloud className="h-5 w-5 text-[#2ca6e9]" />
                  <p className="text-xs font-medium text-slate-200">File Metadata Audit</p>
                  <p className="text-[10px] text-slate-400">EXIF GPS, Author, Software (JPG, PDF, DOCX)</p>
                </div>
              )}
            </div>

            {/* Screenshot OCR Zone */}
            <div
              onClick={() => screenshotInputRef.current?.click()}
              className={`relative rounded-2xl border border-dashed p-4 text-center cursor-pointer transition-all ${
                screenshot
                  ? "border-[#2ca6e9]/60 bg-[#2ca6e9]/10"
                  : "border-[#2ca6e9]/25 bg-[#030912]/60 hover:border-[#2ca6e9]/50 hover:bg-[#071927]"
              }`}
            >
              <input
                type="file"
                ref={screenshotInputRef}
                onChange={handleScreenshotChange}
                accept="image/*"
                className="hidden"
              />

              {screenshot ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate text-left">
                    <ImageIcon className="h-4 w-4 text-[#2ca6e9] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#fafeff] truncate">{screenshot.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(screenshot.size / 1024 / 1024).toFixed(2)} MB • OCR Ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScreenshot(null);
                      if (screenshotInputRef.current) screenshotInputRef.current.value = "";
                    }}
                    className="rounded-full bg-[#071927] p-1 text-slate-400 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <ImageIcon className="h-5 w-5 text-[#169b5c]" />
                  <p className="text-xs font-medium text-slate-200">Profile Screenshot OCR</p>
                  <p className="text-[10px] text-slate-400">Auto-detect emails & phone numbers in images</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <button
          type="submit"
          disabled={!hasPayload || isScanning}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#169b5c] via-[#2ca6e9] to-[#169b5c] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#169b5c]/25 transition-all hover:scale-[1.01] hover:shadow-[#2ca6e9]/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Synthesizing Multi-Vector Intelligence...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#e0e260] transition-transform group-hover:rotate-12" />
              <span>Launch Complete Privacy Audit</span>
            </>
          )}
        </button>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Password Strength Drawer Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowPasswordChecker(!showPasswordChecker)}
            className="flex w-full items-center justify-between rounded-xl border border-[#2ca6e9]/20 bg-[#04101e]/60 px-4 py-2.5 text-xs text-slate-300 transition-colors hover:border-[#2ca6e9]/50 hover:text-[#fafeff]"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-3.5 w-3.5 text-[#2ca6e9]" />
              <span>Check Password Entropy (Local k-Anonymity)</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#e0e260] transition-transform duration-200 ${
                showPasswordChecker ? "rotate-180" : ""
              }`}
            />
          </button>

          {showPasswordChecker && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <PasswordStrength />
            </div>
          )}
        </div>

        {/* Privacy Assurance Footer Note */}
        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
          <Shield className="h-3.5 w-3.5 text-[#169b5c]" />
          <span>Strict zero-knowledge policy: Scans are processed ephemerally in-memory.</span>
        </div>
      </form>
    </div>
  );
}
