export type ThreatLevel = "CLEAN" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface BreachItem {
  name: string;
  domain: string;
  breachDate: string;
  pwnCount?: number;
  dataClasses: string[];
  description: string;
  isVerified: boolean;
}

export interface AccountExposure {
  platform: string;
  category: "social" | "developer" | "avatar" | "productivity" | "gaming";
  isExposed: boolean;
  profileUrl?: string;
  avatarUrl?: string;
  details?: string;
}

export interface EmailDomainInfo {
  domain: string;
  isDisposable: boolean;
  hasMxRecords: boolean;
  providerType: "custom" | "public_free" | "disposable" | "corporate";
}

export interface ScanReport {
  id: string;
  target: string;
  scannedAt: string;
  threatLevel: ThreatLevel;
  riskScore: number; // 0 (safest) to 100 (highest risk)
  summary: {
    totalBreaches: number;
    exposedDataClasses: string[];
    exposedAccountsCount: number;
    hasPlaintextPasswordLeak: boolean;
  };
  domainInfo: EmailDomainInfo;
  breaches: BreachItem[];
  accountExposures: AccountExposure[];
  recommendations: string[];
}
