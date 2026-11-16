import React, { useMemo } from "react";
import { BreachResult } from "@/lib/hibp/email";
import { Database, AlertCircle } from "lucide-react";

export function BreachDataBreakdown({ breaches }: { breaches: BreachResult[] }) {
  // Always call useMemo before any conditional return to abide by React Rules of Hooks
  const classCounts = useMemo(() => {
    if (!breaches || breaches.length === 0) return [];

    const counts: Record<string, number> = {};
    breaches.forEach((b) => {
      b.dataClasses.forEach((dc) => {
        counts[dc] = (counts[dc] || 0) + 1;
      });
    });

    // Sort by frequency (highest first), then alphabetically
    return Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [breaches]);

  if (!breaches || breaches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-[#2ca6e9]" />
          <h3 className="text-base font-bold text-[#fafeff]">Exposed Data Breakdown</h3>
        </div>
        <span className="text-xs text-[#e0e260] font-mono">
          {classCounts.length} Categories
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Aggregate distribution of compromised data classes across identified breach incidents.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {classCounts.map(([className, count], i) => {
          const isSensitive =
            className.toLowerCase().includes("password") ||
            className.toLowerCase().includes("ssn") ||
            className.toLowerCase().includes("financial") ||
            className.toLowerCase().includes("credit");

          return (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                isSensitive
                  ? "border-red-500/30 bg-red-950/20 text-red-200"
                  : "border-[#2ca6e9]/15 bg-[#030912]/80 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {isSensitive && <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                <span className="text-xs font-medium truncate">{className}</span>
              </div>
              <span
                className={`flex items-center justify-center h-5 min-w-[22px] px-1.5 rounded-full text-[10px] font-bold ${
                  isSensitive
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-[#071927] text-[#2ca6e9] border border-[#2ca6e9]/30"
                }`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
