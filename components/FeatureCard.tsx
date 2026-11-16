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
    <div className="group relative rounded-3xl border border-[#2ca6e9]/15 bg-[#04101e]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#2ca6e9]/40 hover:bg-[#06182c]/80 hover:shadow-2xl hover:shadow-[#2ca6e9]/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-2xl border border-[#169b5c]/30 bg-[#169b5c]/10 p-3 text-[#169b5c] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#2ca6e9]/15 group-hover:text-[#2ca6e9]">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className="rounded-full border border-[#2ca6e9]/20 bg-[#030912] px-2.5 py-0.5 text-[11px] font-semibold text-[#e0e260] transition-colors group-hover:border-[#e0e260]/40">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-[#fafeff] transition-colors group-hover:text-[#2ca6e9]">
        {title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
