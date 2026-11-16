import crypto from "crypto";
import { ScanReport, ThreatLevel, BreachItem, AccountExposure, PasteFinding } from "./types";
import { checkGravatarExposure } from "./gravatar";
import { analyzeEmailDomain } from "./email-check";
import { checkDataBreaches } from "./breaches";
import { pastesScan } from "./pastes";
import { checkXposedOrNotAnalytics } from "@/lib/xposedornot/email";
import { runMetadataScan } from "./metadata";
import { runProfileTextScan } from "./profile-text";

export * from "./types";

export async function runPrivacyScan(
  targetEmail: string,
  fileData?: { fileName: string; fileType: string; buffer: Buffer },
  bioText?: string,
  screenshotBuffer?: Buffer,
  screenshotMimeType?: string
): Promise<ScanReport> {
  const email = targetEmail.trim().toLowerCase();
  const scanId = "scan_" + crypto.randomBytes(6).toString("hex");

  // Run all scanners concurrently with failure isolation (HIBP + XposedOrNot dual engine)
  const [
    domainRes,
    gravatarRes,
    hibpBreachRes,
    xonAnalyticsRes,
    pasteRes,
    metadataRes,
    profileTextRes,
  ] = await Promise.allSettled([
    email ? analyzeEmailDomain(email) : Promise.resolve(null),
    email ? checkGravatarExposure(email) : Promise.resolve(null),
    email ? checkDataBreaches(email) : Promise.resolve([]),
    email ? checkXposedOrNotAnalytics(email) : Promise.resolve({ breaches: [], pastes: [] }),
    email ? pastesScan(email) : Promise.resolve({ success: true, data: [] }),
    fileData ? runMetadataScan(fileData.fileName, fileData.fileType, fileData.buffer) : Promise.resolve([]),
    (bioText || screenshotBuffer) ? runProfileTextScan(bioText, screenshotBuffer, screenshotMimeType) : Promise.resolve([]),
  ]);

  const domainInfo =
    domainRes.status === "fulfilled" && domainRes.value
      ? domainRes.value
      : {
          domain: email ? email.split("@")[1] || "" : "",
          isDisposable: false,
          hasMxRecords: true,
          providerType: "custom" as const,
        };

  const accountExposures: AccountExposure[] = [];
  if (gravatarRes.status === "fulfilled" && gravatarRes.value?.isExposed) {
    accountExposures.push(gravatarRes.value);
  }

  // --- Multi-Source Intelligence Fusion & Deduplication ---
  const hibpBreaches: BreachItem[] =
    hibpBreachRes.status === "fulfilled" && hibpBreachRes.value ? hibpBreachRes.value : [];
  const xonData =
    xonAnalyticsRes.status === "fulfilled" && xonAnalyticsRes.value
      ? xonAnalyticsRes.value
      : { breaches: [], pastes: [] };
  const xonBreaches = xonData.breaches;

  const breachMap = new Map<string, BreachItem>();
  let hibpCount = 0;
  let xonCount = 0;
  let verifiedByBoth = 0;

  // 1. Process HIBP breaches (Primary)
  for (const b of hibpBreaches) {
    hibpCount++;
    const key = (b.domain || b.name).toLowerCase().trim();
    breachMap.set(key, {
      ...b,
      sources: ["HIBP"],
    });
  }

  // 2. Merge XposedOrNot breaches (Secondary verification)
  for (const b of xonBreaches) {
    xonCount++;
    const key = (b.domain || b.name).toLowerCase().trim();
    if (breachMap.has(key)) {
      verifiedByBoth++;
      const existing = breachMap.get(key)!;
      const mergedDataClasses = Array.from(new Set([...existing.dataClasses, ...b.dataClasses]));
      breachMap.set(key, {
        ...existing,
        dataClasses: mergedDataClasses,
        pwnCount: existing.pwnCount || b.affectedAccounts || 0,
        isVerified: existing.isVerified || b.verified,
        sources: ["HIBP", "XposedOrNot"],
      });
    } else {
      breachMap.set(key, {
        name: b.name,
        domain: b.domain,
        breachDate: b.breachDate,
        pwnCount: b.affectedAccounts,
        dataClasses: b.dataClasses,
        description: `Exposed records verified through XposedOrNot breach analytics.`,
        isVerified: b.verified,
        sources: ["XposedOrNot"],
      });
    }
  }

  const breaches = Array.from(breachMap.values());

  // Pastes: Combine HIBP paste account lookups with XposedOrNot paste monitor
  const hibpPastes: PasteFinding[] =
    pasteRes.status === "fulfilled" && pasteRes.value.success && pasteRes.value.data
      ? pasteRes.value.data
      : [];
  const xonPastes = xonData.pastes;

  const pasteMap = new Map<string, PasteFinding>();
  for (const p of hibpPastes) {
    pasteMap.set(p.id.toLowerCase(), p);
  }
  for (const p of xonPastes) {
    const key = (p.id || p.title).toLowerCase();
    if (!pasteMap.has(key)) {
      pasteMap.set(key, p);
    }
  }
  const pasteFindings = Array.from(pasteMap.values());

  const metadataFindings = metadataRes.status === "fulfilled" ? metadataRes.value : [];
  const profileTextFindings = profileTextRes.status === "fulfilled" ? profileTextRes.value : [];

  // Extract unique exposed data classes
  const allDataClasses = new Set<string>();
  let hasPlaintextPasswordLeak = false;

  for (const b of breaches) {
    for (const dc of b.dataClasses) {
      allDataClasses.add(dc);
      if (
        dc.toLowerCase().includes("password") &&
        !dc.toLowerCase().includes("bcrypt") &&
        !dc.toLowerCase().includes("hint")
      ) {
        hasPlaintextPasswordLeak = true;
      }
    }
  }

  // Calculate Risk Score (0 to 100)
  let riskScore = 0;

  // Breach penalties
  riskScore += Math.min(breaches.length * 20, 50);

  // Plaintext password / severe exposure penalty
  if (hasPlaintextPasswordLeak) {
    riskScore += 25;
  } else if (
    breaches.some((b) => b.dataClasses.some((d) => d.toLowerCase().includes("password")))
  ) {
    riskScore += 15;
  }

  // OSINT exposure penalty
  if (accountExposures.length > 0) {
    riskScore += 10;
  }

  // Disposable domain flag
  if (domainInfo.isDisposable) {
    riskScore += 15;
  }

  riskScore = Math.min(Math.max(riskScore, 0), 100);

  // Determine Threat Level
  let threatLevel: ThreatLevel;
  if (riskScore >= 75) {
    threatLevel = "CRITICAL";
  } else if (riskScore >= 50) {
    threatLevel = "HIGH";
  } else if (riskScore >= 25) {
    threatLevel = "MODERATE";
  } else if (riskScore > 0) {
    threatLevel = "LOW";
  } else {
    threatLevel = "CLEAN";
  }

  // Generate customized, actionable recommendations
  const recommendations: string[] = [];

  if (breaches.length > 0) {
    recommendations.push(
      "Immediately rotate passwords for all accounts that shared passwords with breached services."
    );
    recommendations.push(
      "Enable Multi-Factor Authentication (MFA/2FA) via an authenticator app or hardware security key."
    );
  }

  if (accountExposures.some((a) => a.platform.includes("Gravatar"))) {
    recommendations.push(
      "Review your Gravatar privacy settings to conceal public display names or avatar hashes linked to this email."
    );
  }

  if (domainInfo.isDisposable) {
    recommendations.push(
      "Temporary disposable email detected. Avoid using disposable inboxes for critical security recovery channels."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "No active credential leaks discovered. Continue using unique passwords generated with a password manager."
    );
    recommendations.push(
      "Consider using email masking aliases when signing up for new online services."
    );
  }

  // Update risk score for pastes: +5 per paste, capped at 15
  riskScore += Math.min(pasteFindings.length * 5, 15);
  
  // Metadata scoring
  let metaScore = 0;
  for (const finding of metadataFindings) {
    for (const item of finding.findings) {
      if (item.type === 'gps') metaScore += 15;
      if (item.type === 'device' || item.type === 'author') metaScore += 10;
      if (item.type === 'software' || item.type === 'timestamp') metaScore += 5;
    }
  }
  riskScore += Math.min(metaScore, 30);

  // Profile text scoring
  let piiScore = 0;
  for (const finding of profileTextFindings) {
    if (finding.riskLevel === 'CRITICAL') piiScore += 25;
    else if (finding.riskLevel === 'HIGH') piiScore += 15;
    else if (finding.riskLevel === 'MODERATE') piiScore += 10;
    else if (finding.riskLevel === 'LOW') piiScore += 5;
  }
  riskScore += Math.min(piiScore, 40);

  // Clamp again after adding paste, meta and pii score
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  // Re-determine threat level after updating score
  if (riskScore >= 75) {
    threatLevel = "CRITICAL";
  } else if (riskScore >= 50) {
    threatLevel = "HIGH";
  } else if (riskScore >= 25) {
    threatLevel = "MODERATE";
  } else if (riskScore > 0) {
    threatLevel = "LOW";
  } else {
    threatLevel = "CLEAN";
  }

  return {
    id: scanId,
    target: email || "Anonymous Image/Bio Scan",
    scannedAt: new Date().toISOString(),
    threatLevel,
    riskScore,
    summary: {
      totalBreaches: breaches.length,
      exposedDataClasses: Array.from(allDataClasses),
      exposedAccountsCount: accountExposures.length,
      hasPlaintextPasswordLeak,
      providerBreakdown: {
        hibpCount,
        xonCount,
        verifiedByBoth,
      },
    },
    domainInfo,
    breaches,
    accountExposures,
    pasteFindings,
    metadataFindings,
    profileTextFindings,
    recommendations,
  };
}
