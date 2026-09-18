import React from "react";
import { BreachResult } from "@/lib/hibp/email";
import { ShieldAlert, Calendar } from "lucide-react";

export function BreachTimeline({ breaches }: { breaches: BreachResult[] }) {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  // Sort by breachDate (oldest to newest, or newest to oldest. Let's do newest to oldest)
  const sortedBreaches = [...breaches].sort((a, b) => {
    return new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime();
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <Calendar className="h-5 w-5 text-indigo-400" /> Breach Timeline
      </h3>
      <div className="relative border-l border-slate-800 ml-3 space-y-8 pb-4">
        {sortedBreaches.map((breach, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-slate-950" />
            
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
              <h4 className="text-base font-bold text-white">{breach.title}</h4>
              <span className="text-xs font-mono text-slate-500">
                {new Date(breach.breachDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 mb-3">
              {breach.domain ? (
                <span className="text-indigo-400 font-medium">{breach.domain}</span>
              ) : (
                <span className="text-slate-500 italic">Unknown Domain</span>
              )}
              {" "} • {breach.affectedAccounts.toLocaleString()} affected accounts
            </p>
            
            <div className="flex flex-wrap gap-2">
              {breach.dataClasses.map((dc, j) => (
                <span key={j} className="rounded border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  {dc}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
