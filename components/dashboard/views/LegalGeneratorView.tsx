"use client";

import React, { useState, useMemo } from "react";
import { Copy, Mail, CheckCircle2, Download, Building2 } from "lucide-react";
import styles from "./LegalGeneratorView.module.css";

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

export function LegalGeneratorView() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("GDPR");
  const [requestType, setRequestType] = useState<RequestType>("DELETE");
  const [companyName, setCompanyName] = useState("");
  const [privacyEmail, setPrivacyEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [copied, setCopied] = useState(false);

  const selectCompany = (company: { name: string; email: string }) => {
    setCompanyName(company.name);
    setPrivacyEmail(company.email);
  };

  const { subject, body } = useMemo(() => {
    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    let s = "";
    let b = "";

    const nameStr = userName.trim() || "[My Full Legal Name]";
    const companyStr = companyName.trim() || "[Target Organization]";
    const extraStr = additionalInfo.trim()
      ? `\nAccount Reference / Identifying Verification Info:\n${additionalInfo}\n`
      : "";

    if (jurisdiction === "GDPR") {
      if (requestType === "DELETE") {
        s = `Right to Erasure Request (Article 17 GDPR) - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Data Protection Officer / Legal Privacy Team at ${companyStr},\n\n` +
          `I am writing to formally exercise my statutory right to erasure of personal data under Article 17 of the General Data Protection Regulation (EU GDPR / UK GDPR).\n\n` +
          `Please permanently delete and purge all personal data concerning me that is processed, maintained, or stored across your infrastructure and sub-processors. This includes but is not limited to: account records, contact information, financial/transactional history, behavioral telemetry, location pings, device fingerprints, and algorithmic profiles.\n` +
          extraStr +
          `\nPursuant to Article 12(3) GDPR, you are required to respond without undue delay and at the latest within one calendar month of receipt. If you believe any statutory exception under Article 17(3) applies, please specify the exact legal grounds in your formal written reply.\n\n` +
          `Respectfully,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else if (requestType === "ACCESS") {
        s = `Subject Access Request (Article 15 GDPR) - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Data Protection Officer at ${companyStr},\n\n` +
          `Pursuant to Article 15 of the General Data Protection Regulation (GDPR), I hereby request formal confirmation as to whether personal data concerning me is being processed, and where that is the case, full access to that personal data.\n\n` +
          `Please provide a complete copy of all records held, accompanied by disclosures regarding: the purpose of processing, categories of personal data, recipients or categories of recipients, retention periods, and source origins of the data.\n` +
          extraStr +
          `\nPlease provide this dossier within one calendar month in a structured, commonly used machine-readable electronic format (JSON/CSV).\n\n` +
          `Respectfully,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else {
        s = `Right to Object to Processing (Article 21 GDPR) - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Data Protection Officer at ${companyStr},\n\n` +
          `I am writing to formally exercise my right to object to the processing of personal data concerning me pursuant to Article 21 of the General Data Protection Regulation (GDPR).\n\n` +
          `I specifically object to: direct marketing activities, advertising segmentation, profiling, and third-party data broker sharing. Please ensure all telemetry and records associated with my identity are quarantined from further analytics or commercial distribution.\n` +
          extraStr +
          `\nPlease confirm compliance with this objection within one calendar month.\n\n` +
          `Respectfully,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      }
    } else if (jurisdiction === "CCPA") {
      if (requestType === "DELETE") {
        s = `CCPA / CPRA Consumer Request to Delete - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `I am writing as a consumer to exercise my statutory right to delete personal information collected and retained by your business, pursuant to the California Consumer Privacy Act (Cal. Civ. Code § 1798.105) and CPRA amendments.\n\n` +
          `Please delete all personal information you have collected from me from your records, and direct all service providers, contractors, and third parties to delete my personal information from their databases.\n` +
          extraStr +
          `\nPursuant to CCPA regulations, please confirm receipt within 10 business days and fulfill this deletion request within 45 calendar days.\n\n` +
          `Sincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else if (requestType === "ACCESS") {
        s = `CCPA / CPRA Request to Know - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `I am writing to exercise my right to know under the California Consumer Privacy Act (Cal. Civ. Code § 1798.110).\n\n` +
          `Please disclose to me the categories of personal information collected, categories of sources, commercial business purposes for collection, categories of third parties to whom data was disclosed or sold, and specific pieces of personal information collected about me in the preceding 12 months.\n` +
          extraStr +
          `\nPlease furnish this report in a portable format within 45 calendar days.\n\n` +
          `Sincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else {
        s = `Do Not Sell or Share My Personal Information (CCPA/CPRA) - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy Officer at ${companyStr},\n\n` +
          `Pursuant to the California Consumer Privacy Act (Cal. Civ. Code § 1798.120) and California Privacy Rights Act (CPRA), I hereby exercise my right to opt-out of the sale and sharing of my personal information for cross-context behavioral advertising.\n\n` +
          `Please update your systems to immediately suppress my records from all commercial exchanges, data broker networks, and targeted marketing syndications.\n` +
          extraStr +
          `\nPlease confirm that my opt-out preference has been registered within 15 business days.\n\n` +
          `Sincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      }
    } else {
      if (requestType === "DELETE") {
        s = `Formal Request: Complete Deletion & Erasure of Personal Data - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy & Compliance Department at ${companyStr},\n\n` +
          `I am writing to formally request the complete suppression and deletion of all accounts, records, telemetry, and personal identifiers associated with my identity from your systems.\n\n` +
          `Please purge all records and instruct any affiliated data processors or marketing partners to do the same.\n` +
          extraStr +
          `\nPlease confirm once this action has been fully executed.\n\n` +
          `Sincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else if (requestType === "ACCESS") {
        s = `Formal Request: Personal Data Disclosure & Export - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy & Compliance Department at ${companyStr},\n\n` +
          `I am requesting a comprehensive disclosure of all records and personal data that your organization collects, stores, or processes concerning me.\n\n` +
          `Please provide an electronic export of this data at your earliest convenience.\n` +
          extraStr +
          `\nSincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      } else {
        s = `Formal Opt-Out: Commercial Data Sharing & Marketing - ${nameStr}`;
        b =
          `Date: ${today}\n\nTo the Privacy & Compliance Department at ${companyStr},\n\n` +
          `I am formally opting out of all commercial sharing, sale, advertising profiling, and external distribution of my personal data.\n\n` +
          `Please record this opt-out across all internal registries and third-party advertising partners.\n` +
          extraStr +
          `\nSincerely,\n${nameStr}\nEmail: ${userEmail || "[My Contact Email]"}`;
      }
    }

    return { subject: s, body: b };
  }, [jurisdiction, requestType, companyName, userName, userEmail, additionalInfo]);

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    const element = document.createElement("a");
    const file = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `privacy-request-${jurisdiction.toLowerCase()}-${requestType.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const mailtoHref = useMemo(() => {
    return `mailto:${encodeURIComponent(privacyEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [privacyEmail, subject, body]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Statutory Compliance Engine
        </div>
        <h1 className={styles.title}>
          Statutory Privacy <span className={styles.titleAccent}>Notice Generator</span>
        </h1>
        <p className={styles.subtitle}>
          Draft legally enforceable Subject Access Requests (SAR), Right to Erasure mandates, and Do-Not-Sell notices under GDPR Articles 15/17/21 and CCPA/CPRA regulations.
        </p>
      </div>

      <div className={styles.workstation}>
        {/* Form Configuration Card */}
        <div className={styles.formCard}>
          <div>
            <div className={styles.sectionHeading}>1. Statutory Framework</div>
            <div className={styles.tabGroup} style={{ marginTop: "8px" }}>
              {(["GDPR", "CCPA", "GENERAL"] as Jurisdiction[]).map((j) => (
                <button
                  key={j}
                  type="button"
                  className={`${styles.tabBtn} ${jurisdiction === j ? styles.tabBtnActive : ""}`}
                  onClick={() => setJurisdiction(j)}
                >
                  {j === "GDPR"
                    ? "GDPR (EU/UK)"
                    : j === "CCPA"
                    ? "CCPA/CPRA (US)"
                    : "Global Standard"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.sectionHeading}>2. Exercise of Rights</div>
            <div className={styles.tabGroup} style={{ marginTop: "8px" }}>
              <button
                type="button"
                className={`${styles.tabBtn} ${requestType === "DELETE" ? styles.tabBtnActive : ""}`}
                onClick={() => setRequestType("DELETE")}
              >
                Erasure (Delete)
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${requestType === "ACCESS" ? styles.tabBtnActive : ""}`}
                onClick={() => setRequestType("ACCESS")}
              >
                Access (SAR)
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${requestType === "DO_NOT_SELL" ? styles.tabBtnActive : ""}`}
                onClick={() => setRequestType("DO_NOT_SELL")}
              >
                Do Not Sell / Object
              </button>
            </div>
          </div>

          <div>
            <div className={styles.sectionHeading}>
              <Building2 size={14} />
              <span>3. Target Entity Presets</span>
            </div>
            <div className={styles.quickFillRow} style={{ marginTop: "8px" }}>
              <span className={styles.quickLabel}>Quick Fill:</span>
              {POPULAR_COMPANIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => selectCompany(c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Company / Data Controller Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Acme Corp, Experian, Meta"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Data Protection Officer Email (Optional)</label>
            <input
              type="email"
              className={styles.input}
              placeholder="e.g. dpo@target-company.com"
              value={privacyEmail}
              onChange={(e) => setPrivacyEmail(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Your Full Legal Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Jane Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Your Registered Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="e.g. jane@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Identifying Information / Account IDs (Optional)
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="e.g. Account ID #98721, Phone Number, past addresses..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>
        </div>

        {/* Live Preview Card */}
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div className={styles.previewTitleGroup}>
              <span className={styles.previewHeading}>Generated Legal Notice</span>
            </div>
            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleCopy}
              >
                {copied ? <CheckCircle2 size={13} color="var(--brand-emerald)" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleDownload}
              >
                <Download size={13} />
                <span>Export .TXT</span>
              </button>
              {privacyEmail && (
                <a
                  href={mailtoHref}
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                >
                  <Mail size={13} />
                  <span>Send via Email</span>
                </a>
              )}
            </div>
          </div>

          <div className={styles.metaInfoBar}>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Subject:</span>
              <span className={styles.metaVal}>{subject}</span>
            </div>
            {privacyEmail && (
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>To:</span>
                <span className={styles.metaVal}>{privacyEmail}</span>
              </div>
            )}
          </div>

          <div className={styles.previewText}>{body}</div>
        </div>
      </div>
    </div>
  );
}
