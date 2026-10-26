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

export interface PasteFinding {
  id: string;
  source: string;
  title: string;
  date: string;
  emailCount: number;
}

export interface PasteResult {
  success: boolean;
  data: PasteFinding[];
  error?: string;
  dataUnavailable?: boolean;
}

export interface EmailDomainInfo {
  domain: string;
  isDisposable: boolean;
  hasMxRecords: boolean;
  providerType: "custom" | "public_free" | "disposable" | "corporate";
}

export interface MetadataItem {
  type: "gps" | "device" | "software" | "author" | "timestamp";
  label: string;
  value: string;
  riskLevel: ThreatLevel;
}

export interface MetadataFinding {
  fileName: string;
  fileType: string;
  findings: MetadataItem[];
}

export interface ProfileTextFinding {
  source: "bio" | "ocr";
  piiType:
    | "email"
    | "phone"
    | "ssn"
    | "credit_card"
    | "address"
    | "dob"
    | "ipv4"
    | "ipv6"
    | "crypto_wallet";
  matchedText: string;
  riskLevel: ThreatLevel;
  confidence: number;
  recommendation: string;
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
  pasteFindings?: PasteFinding[]; // Optional - Phase 1
  metadataFindings?: MetadataFinding[]; // Optional - Phase 2
  profileTextFindings?: ProfileTextFinding[]; // Optional - Phase 3
  recommendations: string[];
}
