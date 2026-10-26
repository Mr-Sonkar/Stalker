import React, { useMemo } from "react";
import { BreachResult } from "@/lib/hibp/email";
import { Database } from "lucide-react";

export function BreachDataBreakdown({ breaches }: { breaches: BreachResult[] }) {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  // Count exposed data classes across all returned breaches
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    breaches.forEach(b => {
      b.dataClasses.forEach(dc => {
        counts[dc] = (counts[dc] || 0) + 1;
      });
    });

    // Sort by frequency (highest first), then alphabetically
    return Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [breaches]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <Database className="h-5 w-5 text-indigo-400" /> Exposed Data Breakdown
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        This represents the number of distinct breach occurrences containing each data class, not an exact count of individual records.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classCounts.map(([className, count], i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50">
            <span className="text-sm font-medium text-slate-300">{className}</span>
            <span className="flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-red-500/10 text-xs font-bold text-red-400 border border-red-500/20">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
