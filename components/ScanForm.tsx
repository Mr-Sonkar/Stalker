"use client";

import React, { useState, useRef } from "react";
import { Search, Loader2, AlertCircle, UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { ScanResultView } from "./ScanResultView";
import { ScanReport } from "@/lib/scanner/types";
import { PasswordStrength } from "./PasswordStrength";

export function ScanForm() {
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const executeScan = async (target: string, selectedFile?: File | null, bioData?: string, selectedScreenshot?: File | null) => {
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
        setErrorMessage("File is too large (max 10MB)");
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
        setErrorMessage("Screenshot is too large (max 10MB)");
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

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Email Input */}
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
          />
        </div>

        <PasswordStrength />

        {/* Bio Text Input */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <div className="flex items-center gap-2 px-3 pt-2 text-slate-400">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-semibold">Paste your bio (optional)</span>
          </div>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Paste your social media bio here to scan for leaked personal info..."
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Zone */}
          <div
            className="relative rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition-colors hover:border-indigo-500 hover:bg-slate-900/80 cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <UploadCloud className="h-5 w-5" />
                  <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-full bg-slate-800 p-1 hover:bg-slate-700 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <UploadCloud className="h-6 w-6 text-slate-500 mb-1" />
                <p className="text-xs font-medium">Upload file for metadata</p>
                <p className="text-[10px] text-slate-500">(JPG, PDF, DOCX)</p>
              </div>
            )}
          </div>

          {/* Screenshot Upload Zone */}
          <div
            className="relative rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition-colors hover:border-indigo-500 hover:bg-slate-900/80 cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
            onClick={() => screenshotInputRef.current?.click()}
          >
            <input
              type="file"
              ref={screenshotInputRef}
              onChange={handleScreenshotChange}
              accept="image/*"
              className="hidden"
            />

            {screenshot ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium truncate max-w-[150px]">{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScreenshot(null);
                      if (screenshotInputRef.current) screenshotInputRef.current.value = "";
                    }}
                    className="rounded-full bg-slate-800 p-1 hover:bg-slate-700 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {(screenshot.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImageIcon className="h-6 w-6 text-slate-500 mb-1" />
                <p className="text-xs font-medium">Upload profile screenshot</p>
                <p className="text-[10px] text-slate-500">(OCR text extraction)</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={(!query.trim() && !file && !bioText && !screenshot) || isScanning}
          className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <span>Run Complete Scan</span>
          )}
        </button>
      </form>

      {/* Quick Test Chips */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
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
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/30 p-3.5 text-left text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-500">
        🔒 Scans are executed server-side. Files are not saved permanently.
      </p>
    </div>
  );
}
