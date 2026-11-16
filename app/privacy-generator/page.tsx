import React from "react";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata = {
  title: "Statutory Privacy Notice Generator - Privacy Scanner",
  description: "Generate legally enforceable GDPR Art. 17/15/21 and CCPA/CPRA deletion and SAR notices.",
};

export default function PrivacyGeneratorPage() {
  return <DashboardApp initialView="privacy-generator" />;
}
