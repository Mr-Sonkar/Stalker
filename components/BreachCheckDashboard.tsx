"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Key, Search, Loader2 } from "lucide-react";
import { BreachTimeline } from "./BreachTimeline";
import { BreachDataBreakdown } from "./BreachDataBreakdown";
import { PasswordCheck } from "./PasswordCheck";
import { BreachResult } from "@/lib/hibp/email";

export function BreachCheckDashboard() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "password" ? "password" : "email";
  
  const [activeTab, setActiveTab] = useState<"email" | "password">(initialTab);
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state if URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "password" || tab === "email") {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check breaches");
      }

      setBreaches(data.breaches || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
            activeTab === "email"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> Email Breach Check
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
            activeTab === "password"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Key className="h-4 w-4" /> Password Check
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "email" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" /> Account Breach Lookup
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Enter an email address to check if it has been exposed in any known data breaches.
                For testing, use <span className="font-mono text-xs bg-slate-800 px-1 rounded">account-exists@hibp-integration-tests.com</span>.
              </p>

              <form onSubmit={handleEmailCheck} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Check
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 rounded-xl border border-red-900/50 bg-red-950/20 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            {breaches !== null && breaches.length === 0 && !error && (
              <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-8 text-center">
                <ShieldAlert className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Good news — no pwnage found!</h4>
                <p className="text-slate-300">
                  This email address was not found in any public breaches indexed by Have I Been Pwned.
                </p>
              </div>
            )}

            {breaches !== null && breaches.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl border border-red-900/50 bg-red-950/10 p-6">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                      {breaches.length}
                    </span>
                    Breaches Found
                  </h4>
                  <p className="text-sm text-slate-400 mb-6">
                    This email was found in {breaches.length} known data breaches.
                  </p>
                  
                  <BreachDataBreakdown breaches={breaches} />
                </div>
                
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                  <BreachTimeline breaches={breaches} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "password" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <PasswordCheck />
          </div>
        )}
      </div>
    </div>
  );
}
