"use client";

import React, { useState } from "react";
import { Key, AlertTriangle, ShieldCheck, Search, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { sha1, getHashPrefix, getHashSuffix, parsePwnedPasswordsResponse } from "@/lib/hibp/passwords";

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2ca6e9]/10 border border-[#2ca6e9]/25 text-[#2ca6e9]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#fafeff]">Cryptographic k-Anonymity Check</h3>
              <p className="text-xs text-slate-400">
                Local SHA-1 hashing • Only 5 prefix characters leave your device
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#169b5c]/30 bg-[#169b5c]/10 px-3 py-1 text-xs font-semibold text-[#169b5c]">
            HIBP v3 Engine
          </span>
        </div>

        {/* k-Anonymity Explainer Pill */}
        <div className="mt-4 rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-[#2ca6e9] font-semibold mb-1">
            <Shield className="h-4 w-4 text-[#169b5c]" />
            <span>How k-Anonymity protects your password:</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Your password is never transmitted across the network. Your browser computes a 40-character SHA-1 hash locally. Only the first 5 characters are sent to query a list of thousands of possible matching hashes, and the final match is determined locally on your machine.
          </p>
        </div>

        <form onSubmit={handleCheck} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to verify against data breaches..."
              className="w-full rounded-xl border border-[#2ca6e9]/25 bg-[#030912] px-4 py-3 pr-10 text-sm text-[#fafeff] placeholder-slate-500 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#fafeff]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#169b5c]/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Hashing...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Check Exposure</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && !result.error && (
        <div
          className={`animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-3xl border p-8 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl ${
            result.count > 0
              ? "border-red-500/40 bg-red-950/25"
              : "border-[#169b5c]/40 bg-[#169b5c]/10"
          }`}
        >
          {result.count > 0 ? (
            <>
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 mb-2">
                CRITICAL EXPOSURE
              </span>
              <h4 className="text-2xl font-extrabold text-white mb-2">
                Compromised in Known Breaches
              </h4>
              <p className="text-slate-300 max-w-lg leading-relaxed text-sm">
                This password has appeared{" "}
                <span className="font-mono font-bold text-red-400 text-base">
                  {result.count.toLocaleString()}
                </span>{" "}
                times in public breach corpuses and credential dumps.
              </p>
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/40 p-4 max-w-md text-xs text-red-200 text-left">
                <strong>Immediate Action Required:</strong> Never use this password for any account. Automated botnets actively cycle through these lists in credential-stuffing attacks.
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-2xl bg-[#169b5c]/10 border border-[#169b5c]/30 flex items-center justify-center mb-4 text-[#169b5c]">
                <ShieldCheck className="h-8 w-8 text-[#e0e260]" />
              </div>
              <span className="rounded-full border border-[#169b5c]/30 bg-[#169b5c]/10 px-3 py-1 text-xs font-semibold text-[#169b5c] mb-2">
                NO BREACH RECORD
              </span>
              <h4 className="text-2xl font-extrabold text-[#fafeff] mb-2">
                Good News — Zero Exposures Found
              </h4>
              <p className="text-slate-300 max-w-lg leading-relaxed text-sm">
                This password was not found in any indexed public data breaches or paste dumps.
              </p>
              <div className="mt-4 rounded-xl border border-[#169b5c]/25 bg-[#030912]/80 p-4 max-w-md text-xs text-[#fafeff] text-left">
                <strong className="text-[#e0e260]">Security Best Practice:</strong> Even unbreached passwords should be unique across all services. Always use a password manager with 16+ characters.
              </div>
            </>
          )}
        </div>
      )}

      {result?.error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}
