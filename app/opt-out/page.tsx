import React from "react";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata = {
  title: "Data Broker Suppression Dossier - Privacy Scanner",
  description: "Take back your private data with verified opt-out procedures for major brokers.",
};

export default function OptOutPage() {
  return <DashboardApp initialView="opt-out" />;
}
