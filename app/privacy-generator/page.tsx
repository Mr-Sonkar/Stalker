import React from "react";
import { PrivacyRequestForm } from "@/components/PrivacyRequestForm";

export const metadata = {
  title: "Data Privacy Request Generator - Privacy Scan",
  description: "Generate legally robust GDPR, CCPA, and general privacy requests to delete, access, or stop the sale of your personal data.",
};

export default function PrivacyGeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-24 sm:p-12 sm:pt-32">
      <div className="w-full max-w-4xl space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Data Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Request Generator</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Exercise your legal rights. Generate legally robust requests to delete your data, get a copy of it, or opt-out of data sales under GDPR and CCPA.
        </p>
      </div>

      <PrivacyRequestForm />
    </div>
  );
}
