export interface CanvasFingerprint {
  supported: boolean;
  dataUrl: string | null;
  hash: string;
  isTampered: boolean; // True if dual renders produce different outputs (noise injection)
}

export interface WebGLDeepFingerprint {
  supported: boolean;
  vendor: string | null;
  renderer: string | null;
  version: string | null;
  shadingLanguageVersion: string | null;
  extensions: string[];
  maxTextureSize: number;
  maxRenderBufferSize: number;
  maxViewportDims: [number, number];
  vertexShaderPrecision: number;
  fragmentShaderPrecision: number;
  antialias: boolean;
  renderHash: string;
}

export interface AudioDeepFingerprint {
  supported: boolean;
  value: string | null;
  sampleRate: number;
  channelCount: number;
  isTampered: boolean; // True if audio buffer has pseudo-random noise added between runs
}

export interface FontFingerprint {
  supported: boolean;
  detectedFonts: string[];
  totalTested: number;
  hash: string;
}

export interface MediaDevicesFingerprint {
  supported: boolean;
  audioInputCount: number;
  audioOutputCount: number;
  videoInputCount: number;
  voicesCount: number;
  voicesSample: string[];
  hash: string;
}

export interface CapabilitiesFingerprint {
  colorGamut: "p3" | "srgb" | "rec2020" | "unknown";
  hdr: boolean;
  colorDepth: number;
  devicePixelRatio: number;
  maxTouchPoints: number;
  pointerType: "coarse" | "fine" | "none";
  hover: boolean;
  colorScheme: "dark" | "light" | "no-preference";
  reducedMotion: boolean;
  forcedColors: boolean;
  webAssembly: boolean;
  sharedArrayBuffer: boolean;
  serviceWorker: boolean;
  localStorage: boolean;
  indexedDB: boolean;
}

export interface TamperDetection {
  canvasNoiseDetected: boolean;
  audioNoiseDetected: boolean;
  isAutomated: boolean; // navigator.webdriver
  braveDetected: boolean;
  inconsistentPlatform: boolean;
  protectionScore: number; // 0 to 100 (Noise/Farbling index)
  defenseStatus: "STANDARD_EXPOSURE" | "PARTIALLY_PROTECTED" | "ACTIVELY_DEFENDED";
  notes: string[];
}

export interface EntropyReport {
  totalBits: number;
  uniquenessRatio: string;
  uniquenessPercentage: number;
  rarityLevel: "COMMON" | "MODERATE" | "RARE" | "HIGHLY_UNIQUE";
}

export interface DeepFingerprintResult {
  hash: string;
  scannedAt: string;
  canvas: CanvasFingerprint;
  webgl: WebGLDeepFingerprint;
  audio: AudioDeepFingerprint;
  fonts: FontFingerprint;
  media: MediaDevicesFingerprint;
  capabilities: CapabilitiesFingerprint;
  navigator: {
    userAgent: string;
    browserName: string;
    languages: string[];
    doNotTrack: string | null;
    cookiesEnabled: boolean;
    platform: string;
    hardwareConcurrency: number | null;
    deviceMemory: number | null;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    devicePixelRatio: number;
    colorDepth: number;
    timezone: string;
    timezoneOffset: number;
  };
  tamper: TamperDetection;
  entropy: EntropyReport;
}
