"use client";

import React, { useState, useMemo } from "react";
import { Copy, Mail, CheckCircle2, Scale, Download, Building2 } from "lucide-react";

type Jurisdiction = "GDPR" | "CCPA" | "GENERAL";
type RequestType = "DELETE" | "ACCESS" | "DO_NOT_SELL";

const POPULAR_COMPANIES = [
  { name: "Google", email: "data-protection-office@google.com" },
  { name: "Meta", email: "privacy@facebook.com" },
  { name: "Amazon", email: "privacyshield@amazon.com" },
  { name: "LexisNexis", email: "privacy.inquiry@lexisnexis.com" },
  { name: "Experian", email: "optout@experian.com" },
  { name: "Whitepages", email: "privacy@whitepages.com" },
  { name: "Spokeo", email: "privacy@spokeo.com" },
];

export function PrivacyRequestForm() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("GDPR");
  const [requestType, setRequestType] = useState<RequestType>("DELETE");
  const [companyName, setCompanyName] = useState("");
  const [privacyEmail, setPrivacyEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedEmail = useMemo(() => {
    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    let subject = "";
    let body = "";

    const nameStr = userName.trim() || "[My Name]";
    const companyStr = companyName.trim() || "[Company Name]";
    const extraStr = additionalInfo.trim()
      ? `\nAccount Reference / Identifying Information:\n${additionalInfo}\n`
      : "";

    if (jurisdiction === "GDPR") {
      if (requestType === "DELETE") {
        subject = `Right to Erasure Request (Article 17 GDPR) - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally request the erasure of all personal data that you process or store concerning me, pursuant to my statutory rights under Article 17 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please permanently purge all personal data, including but not limited to my user profile, transaction histories, telemetric logs, behavioural profiling records, and communications, from all your systems and any sub-processors with whom it has been shared.\n` +
          extraStr +
          `\nPlease confirm in writing within one calendar month that this deletion has been completed across all production systems and cold backups. If you claim an exemption under Article 17(3), please identify the precise legal grounds.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `Subject Access Request (Article 15 GDPR) - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally request full access to all personal data you hold concerning me, pursuant to Article 15 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please provide a machine-readable export of all records, including categories of data processed, recipients of third-party transfers, retention periods, and automated decision-making logic.\n` +
          extraStr +
          `\nPlease provide this dossier within one calendar month in a structured, commonly used electronic format (JSON/CSV/PDF).\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `Objection to Processing & Profiling (Article 21 GDPR) - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally object to the processing of my personal data for direct marketing, advertising segmentation, and automated profiling, pursuant to Article 21 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please immediately cease using my profile for advertising, and ensure it is not shared with, monetized through, or sold to third-party data brokers.\n` +
          extraStr +
          `\nPlease confirm compliance in writing within one month.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      }
    } else if (jurisdiction === "CCPA") {
      if (requestType === "DELETE") {
        subject = `CCPA/CPRA Deletion Request - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `I am a resident exercising my right to delete personal information collected by your business under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).\n\n` +
          `Please delete all personal information and direct all service providers, contractors, and third parties to delete my personal information from their databases.\n` +
          extraStr +
          `\nPlease confirm within 45 days that this request has been honored.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `CCPA Request to Know - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `I am writing to exercise my Right to Know under the California Consumer Privacy Act (CCPA).\n\n` +
          `Please disclose the specific pieces of personal information collected about me over the preceding 12 months, along with categories of sources, commercial purposes, and categories of third parties to whom data was disclosed or sold.\n` +
          extraStr +
          `\nPlease provide this disclosure within 45 days.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `Do Not Sell or Share My Personal Information (CCPA/CPRA) - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `I am exercising my statutory right to opt-out of the sale and sharing of my personal information for cross-context behavioral advertising under the California Consumer Privacy Act (CCPA) and CPRA.\n\n` +
          `Please record my opt-out preference and immediately cease all data transfers meeting the definition of 'sale' or 'sharing'.\n` +
          extraStr +
          `\nPlease confirm compliance within 15 business days.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      }
    } else {
      if (requestType === "DELETE") {
        subject = `Formal Notice: Account & Personal Data Deletion Request - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy & Compliance Team at ${companyStr},\n\n` +
          `I am writing to formally request the complete suppression and deletion of all accounts and records associated with my identity from your systems.\n\n` +
          `Please confirm that my email, contact details, payment info, and tracking data have been expunged from all live environments and downstream vendors.\n` +
          extraStr +
          `\nPlease confirm in writing once my data has been expunged.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `Formal Request for Personal Data Disclosure - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy Team at ${companyStr},\n\n` +
          `I am writing to request a copy of all personal records and telemetry information currently stored under my identity.\n\n` +
          extraStr +
          `\nPlease provide this information in an accessible electronic format.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `Opt-Out of Data Monetization & Third-Party Sharing - ${nameStr}`;
        body = `Date: ${today}\n\nTo the Privacy Team at ${companyStr},\n\n` +
          `I am requesting that you immediately suppress my records from all third-party marketing lists, data broker feeds, and targeted advertising platforms.\n\n` +
          extraStr +
          `\nPlease confirm in writing once my preferences have been updated.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      }
    }

    return { subject, body };
  }, [jurisdiction, requestType, companyName, userName, userEmail, additionalInfo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([`${generatedEmail.subject}\n\n${generatedEmail.body}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `Privacy_Request_${companyName || "Organization"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const mailtoLink = `mailto:${privacyEmail}?subject=${encodeURIComponent(
    generatedEmail.subject
  )}&body=${encodeURIComponent(generatedEmail.body)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      {/* Form Section */}
      <div className="space-y-6 rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[#2ca6e9]/15 pb-4">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-[#2ca6e9]" />
            <h2 className="text-xl font-bold text-[#fafeff]">Legal Notice Builder</h2>
          </div>
          <span className="rounded-full border border-[#169b5c]/30 bg-[#169b5c]/10 px-2.5 py-0.5 text-xs font-semibold text-[#169b5c]">
            Statutory Compliant
          </span>
        </div>

        {/* Quick Pre-fills */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-[#2ca6e9]" />
            <span>Quick Pre-fill Common Organizations:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COMPANIES.map((comp) => (
              <button
                key={comp.name}
                type="button"
                onClick={() => {
                  setCompanyName(comp.name);
                  setPrivacyEmail(comp.email);
                }}
                className="rounded-lg border border-[#2ca6e9]/20 bg-[#030912] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-[#169b5c] hover:text-[#fafeff]"
              >
                {comp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Legal Jurisdiction
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["GDPR", "CCPA", "GENERAL"] as Jurisdiction[]).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJurisdiction(j)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    jurisdiction === j
                      ? "bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] text-white shadow-md shadow-[#169b5c]/25 border-transparent"
                      : "bg-[#030912] text-slate-400 border border-[#2ca6e9]/15 hover:border-[#2ca6e9]/40 hover:text-slate-200"
                  }`}
                >
                  {j === "GENERAL" ? "International" : j}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Request Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRequestType("DELETE")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  requestType === "DELETE"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30 border-transparent"
                    : "bg-[#030912] text-slate-400 border border-slate-800 hover:border-red-500/40"
                }`}
              >
                Purge / Delete (Art 17)
              </button>
              <button
                type="button"
                onClick={() => setRequestType("ACCESS")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  requestType === "ACCESS"
                    ? "bg-[#169b5c] text-white shadow-md shadow-[#169b5c]/30 border-transparent"
                    : "bg-[#030912] text-slate-400 border border-slate-800 hover:border-[#169b5c]/50"
                }`}
              >
                Subject Access (Art 15)
              </button>
              <button
                type="button"
                onClick={() => setRequestType("DO_NOT_SELL")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  requestType === "DO_NOT_SELL"
                    ? "bg-[#e0e260] text-[#03080e] font-bold shadow-md shadow-[#e0e260]/30 border-transparent"
                    : "bg-[#030912] text-slate-400 border border-slate-800 hover:border-[#e0e260]/50"
                }`}
              >
                Do Not Sell / Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-3 py-2.5 text-xs text-[#fafeff] placeholder-slate-600 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Privacy/DPO Email
              </label>
              <input
                type="email"
                value={privacyEmail}
                onChange={(e) => setPrivacyEmail(e.target.value)}
                placeholder="dpo@acme.com"
                className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-3 py-2.5 text-xs text-[#fafeff] placeholder-slate-600 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Your Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-3 py-2.5 text-xs text-[#fafeff] placeholder-slate-600 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Your Contact Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-3 py-2.5 text-xs text-[#fafeff] placeholder-slate-600 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Account Identification (Username, Account ID, or Phone)
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Account ID #987654 or associated phone"
              className="w-full rounded-xl border border-[#2ca6e9]/20 bg-[#030912] px-3 py-2.5 text-xs text-[#fafeff] placeholder-slate-600 focus:border-[#2ca6e9] focus:outline-none focus:ring-1 focus:ring-[#2ca6e9]"
            />
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex-1 rounded-3xl border border-[#2ca6e9]/20 bg-[#04101e]/85 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="bg-[#030912]/90 border-b border-[#2ca6e9]/15 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-mono text-[#e0e260] truncate max-w-[280px]">
              Subject: {generatedEmail.subject}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-[#2ca6e9] hover:text-[#e0e260] transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-[#169b5c]" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-[#fafeff] transition-colors"
                title="Download as .txt"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1">
            <textarea
              readOnly
              value={generatedEmail.body}
              className="w-full h-full min-h-[340px] bg-transparent text-xs text-slate-300 resize-none focus:outline-none font-mono leading-relaxed"
            />
          </div>
        </div>

        <a
          href={privacyEmail ? mailtoLink : "#"}
          onClick={(e) => {
            if (!privacyEmail) {
              e.preventDefault();
              alert("Please enter or select a target privacy email address first.");
            }
          }}
          className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-[#169b5c] to-[#2ca6e9] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#169b5c]/25 transition-all hover:opacity-95 active:scale-95"
        >
          <Mail className="h-4 w-4" />
          <span>Dispatch Notice in Default Email Client</span>
        </a>
      </div>
    </div>
  );
}
