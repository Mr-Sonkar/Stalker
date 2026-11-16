"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldAlert, Key, Search, Loader2, CheckCircle2 } from "lucide-react";
import { BreachTimeline } from "./BreachTimeline";
import { BreachDataBreakdown } from "./BreachDataBreakdown";
import { PasswordCheck } from "./PasswordCheck";
import { BreachResult } from "@/lib/hibp/email";

export function BreachCheckDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "password" ? "password" : "email";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: "email" | "password") => {
    router.replace(`/breach-check${tab === "password" ? "?tab=password" : ""}`, {
      scroll: false,
    });
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setBreaches(null);

    try {
      const response = await fetch("/api/breach-check/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check breaches");
      }

      setBreaches(data.breaches || []);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Tab Switcher */}
      <div className="flex p-1.5 space-x-2 bg-[#04101e]/80 rounded-2xl border border-[#2ca6e9]/20 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => handleTabChange("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "email"
              ? "bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] text-[#fafeff] shadow-md shadow-[#169b5c]/30"
              : "text-slate-400 hover:text-[#fafeff] hover:bg-[#071927]"
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-[#e0e260]" />
          <span>Email Breach Radar</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("password")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "password"
              ? "bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] text-[#fafeff] shadow-md shadow-[#169b5c]/30"
              : "text-slate-400 hover:text-[#fafeff] hover:bg-[#071927]"
          }`}
        >
          <Key className="h-4 w-4 text-[#2ca6e9]" />
          <span>Password k-Anonymity Check</span>
        </button>
      </div>

      {/* Content View */}
      <div className="min-h-[400px]">
        {activeTab === "email" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search Input Card */}
            <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/85 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2ca6e9]/10 border border-[#2ca6e9]/25 text-[#2ca6e9]">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#fafeff]">Account Breach Radar</h3>
                    <p className="text-xs text-slate-400">
                      Cross-references global breach archives and credential dump indexes
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-[#e0e260]/30 bg-[#e0e260]/10 px-3 py-1 text-xs font-semibold text-[#e0e260]">
                  Real-Time Query
                </span>
              </div>

              <form onSubmit={handleEmailCheck} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to audit (e.g. name@domain.com)..."
                    className="w-full rounded-xl border border-[#2ca6e9]/25 bg-[#030912] px-4 py-3 text-sm text-[#fafeff] placeholder-slate-500 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#169b5c]/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scanning Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Check Exposure</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Email Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-400">Test account:</span>
                <button
                  type="button"
                  onClick={() => setEmail("account-exists@hibp-integration-tests.com")}
                  className="rounded-lg border border-[#2ca6e9]/25 bg-[#030912] px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-[#169b5c] hover:text-[#e0e260] font-mono"
                >
                  account-exists@hibp-integration-tests.com
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* Breaches View */}
            {breaches && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {breaches.length > 0 ? (
                  <>
                    <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[#fafeff]">
                            Compromised in {breaches.length} Data Breaches
                          </h4>
                          <p className="text-xs text-red-300/80">
                            Immediate password reset and 2FA activation recommended
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                        High Risk
                      </span>
                    </div>

                    <BreachDataBreakdown breaches={breaches} />
                    <BreachTimeline breaches={breaches} />
                  </>
                ) : (
                  <div className="rounded-3xl border border-[#169b5c]/30 bg-[#169b5c]/10 p-8 text-center shadow-2xl backdrop-blur-xl">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#169b5c]/20 border border-[#169b5c]/30 text-[#169b5c] mb-3">
                      <CheckCircle2 className="h-7 w-7 text-[#e0e260]" />
                    </div>
                    <h4 className="text-xl font-bold text-[#fafeff]">No Breaches Found!</h4>
                    <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
                      This email address does not appear in any known public breach indexes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "password" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PasswordCheck />
          </div>
        )}
      </div>
    </div>
  );
}
