import React from "react";
import { BrowserFingerprint } from "@/components/BrowserFingerprint";

export const metadata = {
  title: "Browser Fingerprinting - Privacy Scan",
  description: "See what characteristics your browser exposes that can potentially be used for tracking.",
};

export default function FingerprintPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-24 sm:p-12 sm:pt-32">
      <div className="w-full max-w-4xl space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Browser <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Fingerprinting</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Websites don't need cookies to track you. Your browser automatically broadcasts unique hardware and software configurations.
        </p>
      </div>

      <BrowserFingerprint />
    </div>
  );
}
