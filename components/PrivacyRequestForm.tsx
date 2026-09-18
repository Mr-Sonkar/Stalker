"use client";

import React, { useState, useMemo } from "react";
import { Copy, Mail, CheckCircle2, Scale } from "lucide-react";

type Jurisdiction = "GDPR" | "CCPA" | "GENERAL";
type RequestType = "DELETE" | "ACCESS" | "DO_NOT_SELL";

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
    const today = new Date().toLocaleDateString();
    let subject = "";
    let body = "";

    const nameStr = userName.trim() || "[My Name]";
    const companyStr = companyName.trim() || "[Company Name]";
    const extraStr = additionalInfo.trim() ? `\nAdditional Information to identify my account:\n${additionalInfo}\n` : "";

    if (jurisdiction === "GDPR") {
      if (requestType === "DELETE") {
        subject = `Right to Erasure Request (Article 17 GDPR) - ${nameStr}`;
        body = `To the Privacy/Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to request the erasure of all personal data that you hold about me, pursuant to my rights under Article 17 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please permanently delete my personal data, including but not limited to my account, transaction history, profiling data, and communications, from all your systems and any third-party processors you have shared it with.\n` +
          extraStr +
          `\nPlease confirm in writing within one month that this request has been fulfilled. If you refuse this request, please provide the specific legal exemption you are relying on.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `Subject Access Request (Article 15 GDPR) - ${nameStr}`;
        body = `To the Privacy/Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally request access to the personal data you hold about me, pursuant to my rights under Article 15 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please provide a copy of all personal data, including but not limited to account details, analytics, profiling, and third-party data sharing logs.\n` +
          extraStr +
          `\nPlease provide this information in a commonly used electronic format within one month. If you refuse this request, please provide the specific legal exemption you are relying on.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `Objection to Processing/Marketing (Article 21 GDPR) - ${nameStr}`;
        body = `To the Privacy/Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally object to the processing of my personal data for direct marketing and profiling purposes, pursuant to my rights under Article 21 of the General Data Protection Regulation (GDPR).\n\n` +
          `Please immediately cease using my data for advertising, and ensure it is not shared with or sold to third-party data brokers or marketing partners.\n` +
          extraStr +
          `\nPlease confirm in writing within one month that you have complied with this objection.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      }
    } else if (jurisdiction === "CCPA") {
      if (requestType === "DELETE") {
        subject = `CCPA Deletion Request - ${nameStr}`;
        body = `To the Privacy Officer at ${companyStr},\n\n` +
          `I am a California resident and I am writing to exercise my right to delete personal information under the California Consumer Privacy Act (CCPA) and CPRA.\n\n` +
          `Please permanently delete all personal information that your business has collected from or about me.\n` +
          extraStr +
          `\nPlease confirm within 45 days that this deletion has been completed across your systems and your service providers.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `CCPA Request to Know - ${nameStr}`;
        body = `To the Privacy Officer at ${companyStr},\n\n` +
          `I am a California resident and I am writing to exercise my right to know under the California Consumer Privacy Act (CCPA).\n\n` +
          `Please provide the specific pieces of personal information you have collected about me over the past 12 months, as well as the categories of sources, business purposes, and categories of third parties with whom you have shared it.\n` +
          extraStr +
          `\nPlease provide this information in a portable, readily usable format within 45 days.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `CCPA Do Not Sell or Share My Personal Information - ${nameStr}`;
        body = `To the Privacy Officer at ${companyStr},\n\n` +
          `I am a California resident and I am writing to exercise my right to opt-out of the sale or sharing of my personal information under the California Consumer Privacy Act (CCPA) and CPRA.\n\n` +
          `Please immediately cease selling or sharing my personal data for cross-context behavioral advertising.\n` +
          extraStr +
          `\nPlease confirm in writing within 15 business days that you have honored this opt-out request.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      }
    } else {
      // GENERAL
      if (requestType === "DELETE") {
        subject = `Request for Account & Data Deletion - ${nameStr}`;
        body = `To the Privacy Team at ${companyStr},\n\n` +
          `I am writing to formally request the complete deletion of my account and all associated personal data from your systems and any third-party partners.\n\n` +
          extraStr +
          `\nPlease confirm in writing once my data has been permanently deleted.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "ACCESS") {
        subject = `Request for Data Access - ${nameStr}`;
        body = `To the Privacy Team at ${companyStr},\n\n` +
          `I am writing to request a copy of all personal data and account information you currently hold about me.\n\n` +
          extraStr +
          `\nPlease provide this information in a readable electronic format at your earliest convenience.\n\n` +
          `Sincerely,\n${nameStr}\n${userEmail}`;
      } else if (requestType === "DO_NOT_SELL") {
        subject = `Opt-Out of Data Sharing/Marketing - ${nameStr}`;
        body = `To the Privacy Team at ${companyStr},\n\n` +
          `I am writing to request that you immediately stop sharing, selling, or using my personal data for marketing, advertising, or profiling purposes.\n\n` +
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

  const mailtoLink = `mailto:${privacyEmail}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      {/* Form Section */}
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Scale className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Request Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Jurisdiction</label>
            <div className="grid grid-cols-3 gap-2">
              {(["GDPR", "CCPA", "GENERAL"] as Jurisdiction[]).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJurisdiction(j)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    jurisdiction === j
                      ? "bg-indigo-600 text-white border-transparent"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-indigo-500/50"
                  }`}
                >
                  {j === "GENERAL" ? "Other" : j}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Request Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRequestType("DELETE")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  requestType === "DELETE"
                    ? "bg-red-600 text-white border-transparent"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-red-500/50"
                }`}
              >
                Delete Data
              </button>
              <button
                type="button"
                onClick={() => setRequestType("ACCESS")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  requestType === "ACCESS"
                    ? "bg-emerald-600 text-white border-transparent"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                Access Data
              </button>
              <button
                type="button"
                onClick={() => setRequestType("DO_NOT_SELL")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  requestType === "DO_NOT_SELL"
                    ? "bg-orange-600 text-white border-transparent"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-orange-500/50"
                }`}
              >
                Do Not Sell
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Privacy Email</label>
              <input
                type="email"
                value={privacyEmail}
                onChange={(e) => setPrivacyEmail(e.target.value)}
                placeholder="privacy@acme.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Your Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Account ID or Username (Optional)</label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Account ID: 123456"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Subject: {generatedEmail.subject}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="p-4 flex-1">
            <textarea
              readOnly
              value={generatedEmail.body}
              className="w-full h-full min-h-[300px] bg-transparent text-sm text-slate-300 resize-none focus:outline-none font-mono leading-relaxed"
            />
          </div>
        </div>

        <a
          href={privacyEmail ? mailtoLink : "#"}
          onClick={(e) => { if (!privacyEmail) { e.preventDefault(); alert("Please enter a target privacy email first."); } }}
          className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
        >
          <Mail className="h-5 w-5" />
          Open in Email Client
        </a>
      </div>
    </div>
  );
}
