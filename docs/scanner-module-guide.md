# Scanner Module Development Guide

## Module Contract

Every scanner module MUST follow this exact contract:

```typescript
// lib/scanner/<module-name>.ts

import type { ScanReport, <Module>Result } from './types'

export async function <moduleName>Scan(input: <Module>Input): Promise<<Module>Result> {
  // 1. Validate input
  // 2. Call external API / process data with timeout
  // 3. Handle ALL errors internally — NEVER throw
  // 4. Return structured result matching <Module>Result type
}

// Result type MUST include failure metadata:
interface <Module>Result {
  success: boolean
  data?: <Module>Data
  error?: string
  dataUnavailable?: boolean  // For graceful degradation
}
```

## Required Patterns

### 1. Timeout Wrapper (All External Calls)
```typescript
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ])
}
```

### 2. Graceful Degradation (Never Throw)
```typescript
export async function breachesScan(email: string): Promise<BreachesResult> {
  try {
    const data = await withTimeout(fetchHIBP(email), 5000)
    return { success: true, data }
  } catch (error) {
    // Log for debugging, return structured failure
    console.warn('[breaches] Scan failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      dataUnavailable: true  // Signals UI to show "data unavailable" not "error"
    }
  }
}
```

### 3. Type-First Development
- Add new interfaces to `types.ts` FIRST
- Run `npx tsc --noEmit` to verify types
- Then implement module

### 4. Testing Requirements
- Unit test file: `lib/scanner/__tests__/<module>.test.ts`
- Test cases: success, timeout, API error, rate limit, malformed response
- Mock external dependencies (no real network calls in tests)
- Target: ≥80% coverage per module

## Integration Checklist

When adding a new module:
- [ ] Add result interface to `types.ts`
- [ ] Add field to `ScanReport` interface (optional for phased rollout)
- [ ] Create module file with contract compliance
- [ ] Add unit tests
- [ ] Import and add to `Promise.allSettled` in `index.ts`
- [ ] Extend scoring algorithm in `index.ts`
- [ ] Add UI card component in `ScanResultView.tsx`
- [ ] Update API response type if needed
- [ ] Run full test suite: `npm test`
- [ ] Verify manual scan works end-to-end

## Existing Modules Reference

### breaches.ts
- Input: `email: string`
- Output: `BreachesResult { success, data?: BreachFinding[], error?, dataUnavailable? }`
- Timeout: 5s
- Fallback: Local catalog of 6 major breaches

### email-check.ts
- Input: `email: string`
- Output: `EmailCheckResult { success, data?: DomainInfo, error? }`
- No external API (uses Node DNS)
- Classifies: custom, public_free, disposable, corporate

### gravatar.ts
- Input: `email: string`
- Output: `GravatarResult { success, data?: OSINTFinding, error?, dataUnavailable? }`
- Uses SHA-256 hash of email
- Checks profile JSON + avatar existence

### pastes.ts (planned)
- Input: `email: string`
- Output: `PastesResult { success, data?: PasteFinding[], error?, dataUnavailable? }`
- Uses SHA-1 hash (HIBP requirement)
- Timeout: 5s