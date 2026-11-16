"use client";

import React, { useState, useMemo } from "react";
import { Copy, Mail, CheckCircle2, Scale, Download, Building2 } from "lucide-react";
import styles from "./PrivacyRequestForm.module.css";

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
    <div className={styles.container}>
      {/* Form Section */}
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <div className={styles.titleGroup}>
            <Scale className={styles.titleIcon} size={24} />
            <h2 className={styles.title}>Legal Notice Builder</h2>
          </div>
          <span className={styles.badge}>Statutory Compliant</span>
        </div>

        {/* Quick Pre-fills */}
        <div className={styles.prefillSection}>
          <label className={styles.prefillLabel}>
            <Building2 className={styles.prefillIcon} size={14} />
            <span>Quick Pre-fill Common Organizations:</span>
          </label>
          <div className={styles.prefillRow}>
            {POPULAR_COMPANIES.map((comp) => (
              <button
                key={comp.name}
                type="button"
                onClick={() => {
                  setCompanyName(comp.name);
                  setPrivacyEmail(comp.email);
                }}
                className={styles.prefillBtn}
              >
                {comp.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldsSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Legal Jurisdiction</label>
            <div className={styles.jurisdictionGrid}>
              {(["GDPR", "CCPA", "GENERAL"] as Jurisdiction[]).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJurisdiction(j)}
                  className={`${styles.jurisdictionBtn} ${
                    jurisdiction === j ? styles.jurisdictionBtnActive : ""
                  }`}
                >
                  {j === "GENERAL" ? "International" : j}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Request Type</label>
            <div className={styles.requestTypeGrid}>
              <button
                type="button"
                onClick={() => setRequestType("DELETE")}
                className={`${styles.requestBtn} ${
                  requestType === "DELETE" ? styles.requestBtnDeleteActive : ""
                }`}
              >
                Purge / Delete (Art 17)
              </button>
              <button
                type="button"
                onClick={() => setRequestType("ACCESS")}
                className={`${styles.requestBtn} ${
                  requestType === "ACCESS" ? styles.requestBtnAccessActive : ""
                }`}
              >
                Subject Access (Art 15)
              </button>
              <button
                type="button"
                onClick={() => setRequestType("DO_NOT_SELL")}
                className={`${styles.requestBtn} ${
                  requestType === "DO_NOT_SELL" ? styles.requestBtnDoNotSellActive : ""
                }`}
              >
                Do Not Sell / Share
              </button>
            </div>
          </div>

          <div className={styles.twoColRow}>
            <div>
              <label className={styles.fieldLabelInput}>Target Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.fieldLabelInput}>Target Privacy/DPO Email</label>
              <input
                type="email"
                value={privacyEmail}
                onChange={(e) => setPrivacyEmail(e.target.value)}
                placeholder="dpo@acme.com"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.twoColRow}>
            <div>
              <label className={styles.fieldLabelInput}>Your Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.fieldLabelInput}>Your Contact Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="jane@example.com"
                className={styles.input}
              />
            </div>
          </div>

          <div>
            <label className={styles.fieldLabelInput}>
              Account Identification (Username, Account ID, or Phone)
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Account ID #987654 or associated phone"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className={styles.outputSection}>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <span className={styles.subjectText}>
              Subject: {generatedEmail.subject}
            </span>
            <div className={styles.previewActions}>
              <button
                type="button"
                onClick={handleCopy}
                className={styles.actionBtn}
              >
                {copied ? (
                  <CheckCircle2 className={styles.successIcon} size={15} />
                ) : (
                  <Copy size={15} />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
                title="Download as .txt"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          <div className={styles.previewBody}>
            <textarea
              readOnly
              value={generatedEmail.body}
              className={styles.previewTextarea}
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
          className={styles.dispatchBtn}
        >
          <Mail size={16} />
          <span>Dispatch Notice in Default Email Client</span>
        </a>
      </div>
    </div>
  );
}
