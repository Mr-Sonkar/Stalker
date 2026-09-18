import React, { Suspense } from "react";
import { BreachCheckDashboard } from "@/components/BreachCheckDashboard";

export const metadata = {
  title: "Breach & Password Check - Privacy Scanner",
  description: "Securely check if your email or password has been compromised in any known data breaches.",
};

export default function BreachCheckPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-24 sm:p-12 sm:pt-32">
      <div className="w-full max-w-4xl space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Breach Check</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Securely check if your email or passwords have been exposed in data breaches. 
          Powered by Have I Been Pwned.
        </p>
      </div>

      <Suspense fallback={<div className="text-slate-400">Loading dashboard...</div>}>
        <BreachCheckDashboard />
      </Suspense>
    </div>
  );
}
