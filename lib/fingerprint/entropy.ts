import {
  CanvasFingerprint,
  WebGLDeepFingerprint,
  AudioDeepFingerprint,
  FontFingerprint,
  MediaDevicesFingerprint,
  EntropyReport,
} from "./types";

export function calculateEntropy(params: {
  canvas: CanvasFingerprint;
  webgl: WebGLDeepFingerprint;
  audio: AudioDeepFingerprint;
  fonts: FontFingerprint;
  media: MediaDevicesFingerprint;
  screenDimensions: string;
  languagesCount: number;
}): EntropyReport {
  let bits = 0;

  // Realistic empirical modeling: signals have heavy covariance (e.g. OS correlates with fonts, GPU, and audio).
  // In empirical population studies (EFF Cover Your Tracks / Panopticlick), browser entropy in the wild typically spans 10 to 18 bits.
  
  // 1. Canvas contribution (with covariance penalty)
  if (params.canvas.supported) {
    bits += params.canvas.isTampered ? 1.0 : 4.2;
  }

  // 2. WebGL & GPU contribution (heavily correlated with OS & device class)
  if (params.webgl.supported) {
    bits += 3.8;
    if (params.webgl.extensions.length > 20) bits += 1.5;
    if (params.webgl.renderHash !== "unknown") bits += 0.8;
  }

  // 3. System Fonts (correlated with platform)
  if (params.fonts.supported) {
    const fontCount = params.fonts.detectedFonts.length;
    bits += Math.min(fontCount * 0.15, 3.8);
  }

  // 4. Audio & media topology
  if (params.audio.supported) {
    bits += params.audio.isTampered ? 0.5 : 2.0;
  }
  if (params.media.voicesCount > 0) {
    bits += Math.min(params.media.voicesCount * 0.05, 1.2);
  }

  // 5. Screen, DPR & Environment
  bits += 2.0;

  // Cap heuristic estimate to realistic empirical upper bounds (max ~17.5 bits)
  const totalBits = Math.min(Math.round(bits * 10) / 10, 18.0);
  const ratio = Math.round(Math.pow(2, totalBits));

  let uniquenessPercentage = (1 - 1 / Math.max(ratio, 1)) * 100;
  uniquenessPercentage = Math.round(uniquenessPercentage * 100) / 100;

  let rarityLevel: EntropyReport["rarityLevel"] = "COMMON";
  if (totalBits >= 15.5) {
    rarityLevel = "HIGHLY_UNIQUE";
  } else if (totalBits >= 13.0) {
    rarityLevel = "RARE";
  } else if (totalBits >= 9.0) {
    rarityLevel = "MODERATE";
  }

  const uniquenessRatio = `~1 in ${ratio.toLocaleString()} browsers`;

  return {
    totalBits,
    uniquenessRatio,
    uniquenessPercentage,
    rarityLevel,
  };
}
