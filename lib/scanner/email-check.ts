import dns from "dns/promises";
import { EmailDomainInfo } from "./types";

const POPULAR_PUBLIC_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "mail.com",
  "gmx.com",
]);

const DISPOSABLE_PROVIDERS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "dispostable.com",
  "getairmail.com",
]);

export async function analyzeEmailDomain(email: string): Promise<EmailDomainInfo> {
  const parts = email.trim().split("@");
  if (parts.length !== 2 || !parts[1]) {
    return {
      domain: "",
      isDisposable: false,
      hasMxRecords: false,
      providerType: "custom",
    };
  }

  const domain = parts[1].toLowerCase();
  const isDisposable = DISPOSABLE_PROVIDERS.has(domain);
  const isPublic = POPULAR_PUBLIC_PROVIDERS.has(domain);

  let hasMxRecords = true;
  try {
    const mxRecords = await dns.resolveMx(domain);
    hasMxRecords = mxRecords && mxRecords.length > 0;
  } catch {
    // If DNS check fails, fallback safely
    hasMxRecords = isPublic;
  }

  let providerType: EmailDomainInfo["providerType"] = "custom";
  if (isDisposable) {
    providerType = "disposable";
  } else if (isPublic) {
    providerType = "public_free";
  } else {
    providerType = "corporate";
  }

  return {
    domain,
    isDisposable,
    hasMxRecords,
    providerType,
  };
}
