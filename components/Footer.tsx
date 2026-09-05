import React from "react";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-400" />
          <span>Privacy Scanner — Personal Privacy & Digital Exposure Scanner</span>
        </div>
        <p>Built with Next.js App Router, Tailwind CSS, TypeScript & Prisma ORM.</p>
      </div>
    </footer>
  );
}
