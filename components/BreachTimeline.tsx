import React from "react";
import { BreachResult } from "@/lib/hibp/email";
import { Calendar, Users, Globe } from "lucide-react";

export function BreachTimeline({ breaches }: { breaches: BreachResult[] }) {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  // Sort by breachDate (newest to oldest)
  const sortedBreaches = [...breaches].sort((a, b) => {
    return new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime();
  });

  return (
    <div className="rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/75 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#2ca6e9]" />
          <h3 className="text-base font-bold text-[#fafeff]">Chronological Breach Timeline</h3>
        </div>
        <span className="text-xs text-[#e0e260] font-mono">
          {sortedBreaches.length} Recorded Events
        </span>
      </div>

      <div className="relative mt-6 ml-3 space-y-6 border-l border-[#2ca6e9]/20 pb-2">
        {sortedBreaches.map((breach, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-[#03080e]" />

            <div className="rounded-2xl border border-[#2ca6e9]/15 bg-[#030912]/85 p-4 transition-all hover:border-[#2ca6e9]/35">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-bold text-[#fafeff] flex items-center gap-2">
                  <span>{breach.title}</span>
                </h4>
                <span className="font-mono text-xs text-[#e0e260]">
                  {new Date(breach.breachDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                {breach.domain ? (
                  <span className="flex items-center gap-1 text-[#2ca6e9] font-medium">
                    <Globe className="h-3 w-3" />
                    <span>{breach.domain}</span>
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Domain Unspecified</span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="h-3 w-3 text-slate-500" />
                  <span>{breach.affectedAccounts.toLocaleString()} accounts compromised</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {breach.dataClasses.map((dc, j) => {
                  const isPassword = dc.toLowerCase().includes("password");
                  return (
                    <span
                      key={j}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        isPassword
                          ? "border border-red-500/30 bg-red-500/10 text-red-300"
                          : "border border-[#2ca6e9]/20 bg-[#071927] text-slate-300"
                      }`}
                    >
                      {dc}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
