import React from "react";
import { BrowserFingerprint } from "@/components/BrowserFingerprint";

export const metadata = {
  title: "Deep Browser & Hardware Fingerprinting - Privacy Scanner",
  description: "Audit your browser's unique hardware, GPU shader precision, font metrics, audio dynamics, and anti-tracking noise defenses.",
};

export default function FingerprintPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-24 sm:p-12 sm:pt-32">
      <div className="w-full max-w-4xl space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Deep Hardware & Browser <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500">Fingerprinting</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Websites don&apos;t need cookies to track you. Probe your system&apos;s WebGL GPU pipeline, font metrics, audio synthesis, and verify if anti-tracking shields are working.
        </p>
      </div>

      <BrowserFingerprint />
    </div>
  );
}
