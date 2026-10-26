"use client";

import React, { useState } from "react";
import { Key, AlertTriangle, ShieldCheck, Search, Loader2 } from "lucide-react";
import { sha1, getHashPrefix, getHashSuffix, parsePwnedPasswordsResponse } from "@/lib/hibp/passwords";

export function PasswordCheck() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; error?: string } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setResult({ count: 0, error: "Please enter a password." });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // 1. Hash locally in browser
      const fullHash = await sha1(password);
      
      // 2. Split for k-anonymity
      const prefix = getHashPrefix(fullHash);
      const suffix = getHashSuffix(fullHash);

      // 3. Send ONLY 5 chars to API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        throw new Error(`HIBP API Error: ${response.status}`);
      }

      const responseText = await response.text();
      
      // 4. Compare locally
      const count = parsePwnedPasswordsResponse(responseText, suffix);
      
      setResult({ count });
    } catch (err: any) {
      console.error(err);
      setResult({ count: 0, error: err.message || "Failed to check password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-400" /> Secure Password Check (k-Anonymity)
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Your password is never sent to our servers. We hash it locally in your browser and send only the first 5 characters of the hash to Have I Been Pwned.
        </p>

        <form onSubmit={handleCheck} className="flex gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !password}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Check
          </button>
        </form>
      </div>

      {result && !result.error && (
        <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center ${result.count > 0 ? 'border-red-900/50 bg-red-950/20' : 'border-emerald-900/50 bg-emerald-950/20'}`}>
          {result.count > 0 ? (
            <>
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Oh no — pwned!</h4>
              <p className="text-slate-300">
                This password has been seen <span className="font-bold text-red-400">{result.count.toLocaleString()}</span> times in data breaches.
              </p>
              <p className="text-sm text-slate-400 mt-4 max-w-md">
                You should definitely not use this password. If you are currently using it anywhere, change it immediately.
              </p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Good news — no pwnage found!</h4>
              <p className="text-slate-300">
                This password wasn't found in any known data breaches.
              </p>
              <p className="text-sm text-slate-400 mt-4 max-w-md">
                This doesn't guarantee it's a good password, but it hasn't been exposed in the public breaches indexed by HIBP.
              </p>
            </>
          )}
        </div>
      )}

      {result?.error && (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {result.error}
        </div>
      )}
    </div>
  );
}
