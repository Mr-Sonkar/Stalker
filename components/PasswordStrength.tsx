"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ZXCVBNResult } from "zxcvbn";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [zxcvbnLib, setZxcvbnLib] = useState<((pwd: string) => ZXCVBNResult) | null>(null);

  // Load zxcvbn dynamically on mount for performance
  useEffect(() => {
    import("zxcvbn").then((module) => {
      setZxcvbnLib(() => module.default);
    });
  }, []);

  // Compute password score using useMemo rather than setState in an effect
  const result: ZXCVBNResult | null = useMemo(() => {
    if (password && zxcvbnLib) {
      return zxcvbnLib(password);
    }
    return null;
  }, [password, zxcvbnLib]);

  const score = result ? result.score : 0;

  const scoreConfigs = [
    { label: "Very Weak", color: "bg-red-500", text: "text-red-400", border: "border-red-500/30" },
    { label: "Weak", color: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
    { label: "Fair", color: "bg-amber-400", text: "text-amber-300", border: "border-amber-400/30" },
    { label: "Good", color: "bg-[#2ca6e9]", text: "text-[#2ca6e9]", border: "border-[#2ca6e9]/30" },
    { label: "Strong / Resilient", color: "bg-[#169b5c]", text: "text-[#169b5c]", border: "border-[#169b5c]/30" },
  ];

  const currentConfig = scoreConfigs[score] || scoreConfigs[0];

  return (
    <div className="w-full rounded-2xl border border-[#2ca6e9]/20 bg-[#04101e]/80 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2ca6e9]/10 border border-[#2ca6e9]/25 text-[#2ca6e9]">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#fafeff]">Client-Side Password Entropy</h3>
            <p className="text-[11px] text-slate-400">Zero network transmission — evaluated strictly in local memory</p>
          </div>
        </div>
        <span className="rounded-full border border-[#169b5c]/30 bg-[#169b5c]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#169b5c]">
          zxcvbn v4.4
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <input
            id="password-entropy-test"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-4 py-2.5 pr-10 text-sm text-[#fafeff] placeholder-slate-500 transition-colors focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
            placeholder="Test a password pattern for entropy..."
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

        {password ? (
          <div className="space-y-3 pt-1">
            {/* Segmented Strength Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Entropy Rating:</span>
                <span className={`font-semibold ${currentConfig.text}`}>{currentConfig.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((segmentIndex) => {
                  const isActive = score > segmentIndex;
                  return (
                    <div
                      key={segmentIndex}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? currentConfig.color : "bg-[#071927]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Analysis details */}
            {result && (
              <div className="rounded-xl border border-[#2ca6e9]/15 bg-[#030912]/80 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Offline Attack Time:</span>
                  <span className="font-mono font-medium text-[#e0e260]">
                    {result.crack_times_display.offline_slow_hashing_1e4_per_second}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Online Rate-Limited:</span>
                  <span className="font-mono font-medium text-[#2ca6e9]">
                    {result.crack_times_display.online_throttling_100_per_hour}
                  </span>
                </div>

                {result.feedback.warning && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{result.feedback.warning}</span>
                  </div>
                )}

                {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1 pt-1 border-t border-[#2ca6e9]/10">
                    <span className="text-[11px] font-semibold text-slate-400">Hardening Tips:</span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {result.feedback.suggestions.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-[#169b5c] mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            Hint: Combine 4+ random words or passphrases for maximum resistance against GPU hash crackers.
          </p>
        )}
      </div>
    </div>
  );
}
