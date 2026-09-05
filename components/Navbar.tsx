import React from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Privacy Scanner
            </span>
            <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              v0.1.0
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <Link href="#features" className="transition-colors hover:text-slate-100">
            Features
          </Link>
          <Link href="#architecture" className="transition-colors hover:text-slate-100">
            Architecture
          </Link>
          <Link href="#status" className="transition-colors hover:text-slate-100">
            Database Status
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Local Engine Ready
          </div>
        </div>
      </div>
    </header>
  );
}
