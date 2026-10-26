import { getCanvasFingerprint } from "./canvas";
import { getWebGLFingerprint } from "./webgl";
import { getAudioFingerprint } from "./audio";
import { getFontFingerprint } from "./fonts";
import { getMediaDevicesFingerprint } from "./media";
import { getCapabilitiesFingerprint } from "./capabilities";
import { getNavigatorFingerprint } from "./navigator";
import { getScreenFingerprint } from "./screen";
import { detectTampering } from "./tamper";
import { calculateEntropy } from "./entropy";
import { generateHash } from "./hash";
import { DeepFingerprintResult } from "./types";

export * from "./types";

export async function runDeepFingerprint(): Promise<DeepFingerprintResult> {
  // 1. Synchronous signal collection
  const canvas = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const fonts = getFontFingerprint();
  const capabilities = getCapabilitiesFingerprint();
  const nav = getNavigatorFingerprint();
  const screen = getScreenFingerprint();

  // 2. Asynchronous signal collection (Audio, Media devices, Tamper detection)
  const [audio, media] = await Promise.all([
    getAudioFingerprint(),
    getMediaDevicesFingerprint(),
  ]);

  const tamper = await detectTampering(canvas.isTampered, audio.isTampered);

  // 3. Information-theoretic entropy calculation
  const entropy = calculateEntropy({
    canvas,
    webgl,
    audio,
    fonts,
    media,
    screenDimensions: `${screen.width}x${screen.height}`,
    languagesCount: nav.languages.length,
  });

  // 4. Determine browser name
  let browserName = "Unknown Browser";
  const ua = nav.userAgent;
  if (ua.includes("Firefox")) browserName = "Firefox";
  else if (ua.includes("Edg")) browserName = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browserName = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Safari";

  // 5. Composite Canonical Normalization for SHA-256 Hash
  const canonicalData = {
    canvas: canvas.supported ? canvas.hash : "none",
    webgl: webgl.supported
      ? `${webgl.vendor}|${webgl.renderer}|${webgl.extensions.length}|${webgl.renderHash}`
      : "none",
    audio: audio.supported ? audio.value : "none",
    fonts: fonts.supported ? fonts.hash : "none",
    media: media.supported ? media.hash : "none",
    screen: `${screen.width}x${screen.height}@${screen.devicePixelRatio}-${screen.colorDepth}`,
    timezone: screen.timezone,
    languages: nav.languages.join(","),
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    colorGamut: capabilities.colorGamut,
  };

  const hash = await generateHash(canonicalData);

  return {
    hash,
    scannedAt: new Date().toISOString(),
    canvas,
    webgl,
    audio,
    fonts,
    media,
    capabilities,
    navigator: {
      ...nav,
      browserName,
    },
    screen,
    tamper,
    entropy,
  };
}
