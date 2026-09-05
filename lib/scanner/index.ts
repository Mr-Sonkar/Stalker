import crypto from "crypto";
import { ScanReport, ThreatLevel, BreachItem, AccountExposure } from "./types";
import { checkGravatarExposure } from "./gravatar";
import { analyzeEmailDomain } from "./email-check";
import { checkDataBreaches } from "./breaches";

export * from "./types";

export async function runPrivacyScan(targetEmail: string): Promise<ScanReport> {
  const email = targetEmail.trim().toLowerCase();
  const scanId = "scan_" + crypto.randomBytes(6).toString("hex");

  // Run all scanners concurrently with failure isolation
  const [domainRes, gravatarRes, breachRes] = await Promise.allSettled([
    analyzeEmailDomain(email),
    checkGravatarExposure(email),
    checkDataBreaches(email),
  ]);

  const domainInfo =
    domainRes.status === "fulfilled"
      ? domainRes.value
      : {
          domain: email.split("@")[1] || "",
          isDisposable: false,
          hasMxRecords: true,
          providerType: "custom" as const,
        };

  const accountExposures: AccountExposure[] = [];
  if (gravatarRes.status === "fulfilled" && gravatarRes.value.isExposed) {
    accountExposures.push(gravatarRes.value);
  }

  const breaches: BreachItem[] = breachRes.status === "fulfilled" ? breachRes.value : [];

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
  let threatLevel: ThreatLevel = "CLEAN";
  if (riskScore >= 75) {
    threatLevel = "CRITICAL";
  } else if (riskScore >= 50) {
    threatLevel = "HIGH";
  } else if (riskScore >= 25) {
    threatLevel = "MODERATE";
  } else if (riskScore > 0) {
    threatLevel = "LOW";
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

  return {
    id: scanId,
    target: email,
    scannedAt: new Date().toISOString(),
    threatLevel,
    riskScore,
    summary: {
      totalBreaches: breaches.length,
      exposedDataClasses: Array.from(allDataClasses),
      exposedAccountsCount: accountExposures.length,
      hasPlaintextPasswordLeak,
    },
    domainInfo,
    breaches,
    accountExposures,
    recommendations,
  };
}
