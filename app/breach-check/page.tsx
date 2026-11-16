import React from "react";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata = {
  title: "Breach Radar & Credentials - Privacy Scanner",
  description: "Check if your email or credentials have been compromised in verified breach databases.",
};

export default function BreachCheckPage() {
  return <DashboardApp initialView="breach-check" />;
}
