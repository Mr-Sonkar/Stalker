import { ProfileTextFinding } from "./types";
import { detectPII } from "./profile-text/pii-detection";
import { extractTextFromImage, validateImageForOCR } from "./profile-text/ocr";

export interface ProfileTextScanResult {
  findings: ProfileTextFinding[];
  score: number; // 0 to 40
  error?: string;
}

function deduplicateFindings(findings: ProfileTextFinding[]): ProfileTextFinding[] {
  const unique = new Map<string, ProfileTextFinding>();
  
  for (const finding of findings) {
    // A finding is unique by its type and masked text combination
    const key = `${finding.piiType}-${finding.matchedText}`;
    if (!unique.has(key)) {
      unique.set(key, finding);
    } else {
      // If it exists, we could potentially merge sources (e.g. bio + ocr), but for now just keep the first one
      const existing = unique.get(key)!;
      if (existing.source !== finding.source) {
         // Optionally track both sources, but the spec says just deduplicate
      }
    }
  }
  
  return Array.from(unique.values());
}

export async function runProfileTextScan(
  bioText?: string,
  screenshotBuffer?: Buffer,
  screenshotMimeType?: string
): Promise<ProfileTextFinding[]> {
  let allFindings: ProfileTextFinding[] = [];

  // 1. Analyze Bio Text
  if (bioText && bioText.trim().length > 0) {
    const bioFindings = detectPII(bioText, "bio");
    allFindings.push(...bioFindings);
  }

  // 2. Analyze Screenshot (OCR)
  if (screenshotBuffer) {
    // If we don't have mimeType provided explicitly, default to jpeg to let validation try it
    const mimeType = screenshotMimeType || "image/jpeg";
    const validationError = validateImageForOCR(screenshotBuffer, mimeType);
    if (!validationError) {
      try {
        const { text, confidence } = await extractTextFromImage(screenshotBuffer);
        if (text && text.trim().length > 0) {
          const ocrFindings = detectPII(text, "ocr");
          // Apply OCR confidence to these findings
          ocrFindings.forEach(f => f.confidence = Math.min(f.confidence, confidence / 100));
          allFindings.push(...ocrFindings);
        }
      } catch (err: any) {
        console.error("OCR Error:", err);
      }
    }
    
    // Explicitly nullify the buffer reference to encourage GC
    screenshotBuffer = undefined;
  }

  // 3. Deduplicate
  return deduplicateFindings(allFindings);
}
