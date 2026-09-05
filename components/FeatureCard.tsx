import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export function FeatureCard({ icon: Icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/20">
          <Icon className="h-6 w-6" />
        </div>
        {badge && (
          <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 transition-colors group-hover:text-indigo-300">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
