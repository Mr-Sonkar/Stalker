import { ProfileTextFinding, ThreatLevel } from "../types";

// Helper to mask strings partially
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const username = parts[0];
  const domain = parts[1];
  
  if (username.length <= 1) {
    return `•@${domain}`;
  }
  return `${username[0]}${'•'.repeat(Math.max(1, username.length - 1))}@${domain}`;
}

function maskPhone(phone: string): string {
  // Strip non-digits to see length
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '•••-••••';
  const last4 = digits.slice(-4);
  return `(•••) •••-${last4}`;
}

function maskSSN(ssn: string): string {
  const last4 = ssn.replace(/\D/g, '').slice(-4) || '••••';
  return `•••-••-${last4}`;
}

function maskCreditCard(cc: string): string {
  const last4 = cc.replace(/\D/g, '').slice(-4) || '••••';
  return `•••• •••• •••• ${last4}`;
}

function maskIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return '•••.•••.•••.•••';
  return `${parts[0]}.${parts[1]}.•••.•••`;
}

function maskIPv6(ip: string): string {
  return '••••:••••:••••:••••::•••'; // Simplified IPv6 masking
}

function maskCrypto(wallet: string): string {
  if (wallet.length < 8) return '••••••';
  return `${wallet.substring(0, 4)}••••${wallet.substring(wallet.length - 4)}`;
}

// Very basic masking for addresses / dob since they are varied
function maskBasic(text: string): string {
  if (text.length <= 4) return '••••';
  return `${text.substring(0, 2)}•••${text.substring(text.length - 2)}`;
}

export function detectPII(text: string, source: "bio" | "ocr"): ProfileTextFinding[] {
  const findings: ProfileTextFinding[] = [];
  
  // Basic regexes for demonstration/scanning purposes
  const patterns = [
    {
      type: "email" as const,
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      riskLevel: "HIGH" as ThreatLevel,
      recommendation: "Consider using an email alias or removing this from your public profile.",
      masker: maskEmail
    },
    {
      type: "phone" as const,
      regex: /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g,
      riskLevel: "HIGH" as ThreatLevel,
      recommendation: "Remove phone numbers from public view to prevent smishing and SIM swap attacks.",
      masker: maskPhone
    },
    {
      type: "ssn" as const,
      regex: /\b(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
      riskLevel: "CRITICAL" as ThreatLevel,
      recommendation: "CRITICAL: Immediately remove your SSN from any public location.",
      masker: maskSSN
    },
    {
      type: "credit_card" as const,
      regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g,
      riskLevel: "CRITICAL" as ThreatLevel,
      recommendation: "CRITICAL: Credit card details appear to be exposed.",
      masker: maskCreditCard
    },
    {
      type: "ipv4" as const,
      regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      riskLevel: "LOW" as ThreatLevel,
      recommendation: "Consider removing IP addresses if they represent your personal home network.",
      masker: maskIP
    },
    {
      type: "ipv6" as const,
      regex: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
      riskLevel: "LOW" as ThreatLevel,
      recommendation: "Consider removing IP addresses if they represent your personal home network.",
      masker: maskIPv6
    },
    {
      type: "crypto_wallet" as const,
      regex: /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59}|0x[a-fA-F0-9]{40})\b/g,
      riskLevel: "LOW" as ThreatLevel,
      recommendation: "Ensure you intend to publicly share this crypto wallet address.",
      masker: maskCrypto
    },
    {
      type: "dob" as const,
      regex: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g, // MM/DD/YYYY
      riskLevel: "MODERATE" as ThreatLevel,
      recommendation: "Exact birth dates can be used for identity theft and social engineering.",
      masker: maskBasic
    }
  ];

  for (const p of patterns) {
    const matches = text.match(p.regex);
    if (matches) {
      // Deduplicate the actual matches
      const uniqueMatches = Array.from(new Set(matches));
      for (const m of uniqueMatches) {
        findings.push({
          source,
          piiType: p.type,
          matchedText: p.masker(m), // Important: Mask it here!
          riskLevel: p.riskLevel,
          confidence: 1.0, // RegEx matches are high confidence conceptually (though can be false positives contextually)
          recommendation: p.recommendation
        });
      }
    }
  }

  // Very rudimentary address detection (better done with NLP, but regex fallback)
  const addressRegex = /\b\d+\s+([a-zA-Z]+\s+){1,3}(St|Street|Rd|Road|Ave|Avenue|Blvd|Boulevard|Dr|Drive)\b/gi;
  const addressMatches = text.match(addressRegex);
  if (addressMatches) {
    const uniqueAddresses = Array.from(new Set(addressMatches));
    for (const m of uniqueAddresses) {
      findings.push({
        source,
        piiType: "address",
        matchedText: maskBasic(m),
        riskLevel: "HIGH",
        confidence: 0.8,
        recommendation: "Physical addresses should generally not be shared publicly."
      });
    }
  }

  return findings;
}
