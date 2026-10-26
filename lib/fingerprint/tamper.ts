import { TamperDetection } from "./types";

export async function detectTampering(
  canvasNoiseDetected: boolean,
  audioNoiseDetected: boolean
): Promise<TamperDetection> {
  const notes: string[] = [];
  let braveDetected = false;

  // 1. Check for Brave
  try {
    if (typeof navigator !== "undefined" && (navigator as any).brave?.isBrave) {
      braveDetected = await (navigator as any).brave.isBrave();
    }
  } catch {
    braveDetected = false;
  }

  // 2. Automated Webdriver (Puppeteer, Selenium, Playwright)
  const isAutomated = typeof navigator !== "undefined" && Boolean(navigator.webdriver);

  // 3. Inconsistent Platform / User Agent spoofing
  let inconsistentPlatform = false;
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent.toLowerCase();
    const platform = (navigator.platform || "").toLowerCase();

    if (ua.includes("windows") && platform.includes("mac")) inconsistentPlatform = true;
    if (ua.includes("macintosh") && platform.includes("win")) inconsistentPlatform = true;
    if (ua.includes("linux") && platform.includes("win")) inconsistentPlatform = true;
  }

  // 4. Calculate Protection Score & Notes
  let protectionScore = 0;

  if (canvasNoiseDetected) {
    protectionScore += 45;
    notes.push("Canvas Farbling Active: Canvas output dynamically randomizes pixels to defeat tracking.");
  }

  if (audioNoiseDetected) {
    protectionScore += 25;
    notes.push("Audio Noise Injection: OfflineAudioContext modifies frequency bins to prevent audio fingerprinting.");
  }

  if (braveDetected) {
    protectionScore += 20;
    notes.push("Brave Shields: Built-in fingerprint protection detected.");
  }

  if (isAutomated) {
    notes.push("Automated Browser Environment: navigator.webdriver flag is active.");
  }

  if (inconsistentPlatform) {
    protectionScore += 10;
    notes.push("Platform Spoofing: Discrepancy detected between User-Agent and navigator.platform.");
  }

  if (protectionScore === 0) {
    notes.push(
      "No canvas or audio farbling detected. Standard graphics and audio APIs broadcast consistent hardware signatures (content blockers and network VPNs operate independently)."
    );
  }

  protectionScore = Math.min(protectionScore, 100);

  let defenseStatus: TamperDetection["defenseStatus"] = "STANDARD_EXPOSURE";
  if (protectionScore >= 60) {
    defenseStatus = "ACTIVELY_DEFENDED";
  } else if (protectionScore >= 20) {
    defenseStatus = "PARTIALLY_PROTECTED";
  }

  return {
    canvasNoiseDetected,
    audioNoiseDetected,
    isAutomated,
    braveDetected,
    inconsistentPlatform,
    protectionScore,
    defenseStatus,
    notes,
  };
}
