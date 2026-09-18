# Threat Scoring Algorithm Specification

## Overview
Weighted point system producing 0-100 risk score, mapped to 5 threat tiers.

## Scoring Factors (Current - Phase 1)

| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| Breach Found | Per breach (HIBP) | +20 | 50 (max 2-3 breaches) |
| Plaintext Password | Breach contains plaintext passwords | +25 | 25 |
| Hashed Password | Breach contains hashed passwords | +15 | 15 |
| OSINT Exposure | Gravatar profile found | +10 | 10 |
| Disposable Email | Domain in disposable list | +15 | 15 |

## Planned Scoring Extensions

### Phase 2: Metadata Scoring
| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| GPS Coordinates | EXIF contains GPS | +15 | 15 |
| Device Info | Camera make/model exposed | +10 | +10 | 10 |
| Author Name | PDF/DOCX author field | +10 | 10 |
| Software Fingerprint | Creation software exposed | +5 | 5 |
| Timestamps | Creation/modification dates | +5 | 5 |

**Phase 2 Cap: 30 points**

### Phase 3: Profile Text / PII Scoring
| Factor | Condition | Points | Cap |
|--------|-----------|--------|-----|
| SSN / Credit Card | Detected in text/OCR | +25 | 25 |
| Phone / Email / Address | Detected in text/OCR | +15 | 30 |
| Date of Birth | Detected in text/OCR | +10 | 10 |
| IP Address | Detected in text/OCR | +5 | 5 |
| Crypto Wallet | Detected in text/OCR | +5 | 5 |
| Weak Password | zxcvbn score 0-1 | +20 | 20 |
| Reused Password | zxcvbn detects common patterns | +10 | 10 |

**Phase 3 Cap: 50 points**

## Tier Mapping

| Score Range | Tier | Label | Color | Description |
|-------------|------|-------|-------|-------------|
| 0 | 0 | CLEAN | Emerald | No exposure detected |
| 1-24 | 1 | LOW | Green | Minimal exposure |
| 25-49 | 2 | MODERATE | Yellow | Notable exposure — action recommended |
| 50-74 | 3 | HIGH | Orange | Significant exposure — immediate action needed |
| 75-100 | 4 | CRITICAL | Red | Severe exposure — urgent remediation required |

## Algorithm Implementation (lib/scanner/index.ts)

```typescript
function calculateRiskScore(report: ScanReport): { score: number; tier: ThreatTier } {
  let score = 0
  
  // Breach scoring
  score += Math.min(report.breaches.length * 20, 50)
  if (report.summary.hasPlaintextPasswordLeak) score += 25
  else if (report.breaches.some(b => b.hasHashedPasswords)) score += 15
  
  // OSINT scoring
  if (report.accountExposures.some(a => a.isExposed)) score += 10
  
  // Domain scoring
  if (report.domainInfo.isDisposable) score += 15
  
  // Phase 2: Metadata (when implemented)
  if (report.metadataFindings) {
    const hasGPS = report.metadataFindings.some(f => f.findings.some(i => i.type === 'gps'))
    const hasDevice = report.metadataFindings.some(f => f.findings.some(i => i.type === 'device'))
    const hasAuthor = report.metadataFindings.some(f => f.findings.some(i => i.type === 'author'))
    if (hasGPS) score += 15
    if (hasDevice) score += 10
    if (hasAuthor) score += 10
    // ... capped at 30
  }
  
  // Phase 3: Profile Text (when implemented)
  if (report.profileTextFindings) {
    // ... PII-based scoring capped at 40
  }
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))
  
  // Determine tier
  const tier = score === 0 ? 'CLEAN' :
               score <= 24 ? 'LOW' :
               score <= 49 ? 'MODERATE' :
               score <= 74 ? 'HIGH' : 'CRITICAL'
   
  return { score, tier }
}
```

## Testing Requirements

- Unit tests for each scoring factor in isolation
- Integration tests for combined scoring
- Edge case: all factors maxed → score = 100 (CRITICAL)
- Edge case: no findings → score = 0 (CLEAN)
- Regression test: known test emails produce expected tiers
```