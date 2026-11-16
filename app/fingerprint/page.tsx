import React from "react";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata = {
  title: "Browser & Hardware Fingerprint - Privacy Scanner",
  description: "Deep multi-vector hardware entropy audit and anti-fingerprinting farbling detector.",
};

export default function FingerprintPage() {
  return <DashboardApp initialView="fingerprint" />;
}
