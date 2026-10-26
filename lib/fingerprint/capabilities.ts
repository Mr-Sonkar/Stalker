import { CapabilitiesFingerprint } from "./types";

export function getCapabilitiesFingerprint(): CapabilitiesFingerprint {
  let colorGamut: "p3" | "srgb" | "rec2020" | "unknown" = "unknown";
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(color-gamut: rec2020)").matches) {
      colorGamut = "rec2020";
    } else if (window.matchMedia("(color-gamut: p3)").matches) {
      colorGamut = "p3";
    } else if (window.matchMedia("(color-gamut: srgb)").matches) {
      colorGamut = "srgb";
    }
  }

  const hdr =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(dynamic-range: high)").matches
      : false;

  let colorScheme: "dark" | "light" | "no-preference" = "no-preference";
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) colorScheme = "dark";
    else if (window.matchMedia("(prefers-color-scheme: light)").matches) colorScheme = "light";
  }

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const forcedColors =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(forced-colors: active)").matches
      : false;

  let pointerType: "coarse" | "fine" | "none" = "none";
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(pointer: fine)").matches) pointerType = "fine";
    else if (window.matchMedia("(pointer: coarse)").matches) pointerType = "coarse";
  }

  const hover =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(hover: hover)").matches
      : false;

  const maxTouchPoints = typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0;

  const webAssembly = typeof WebAssembly === "object";
  const sharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";
  const serviceWorker = typeof navigator !== "undefined" && "serviceWorker" in navigator;

  let localStorageSupport = false;
  try {
    localStorageSupport = typeof window !== "undefined" && "localStorage" in window;
  } catch {
    localStorageSupport = false;
  }

  let indexedDBSupport = false;
  try {
    indexedDBSupport = typeof window !== "undefined" && "indexedDB" in window;
  } catch {
    indexedDBSupport = false;
  }

  return {
    colorGamut,
    hdr,
    colorDepth: typeof window !== "undefined" ? window.screen.colorDepth || 24 : 24,
    devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    maxTouchPoints,
    pointerType,
    hover,
    colorScheme,
    reducedMotion,
    forcedColors,
    webAssembly,
    sharedArrayBuffer,
    serviceWorker,
    localStorage: localStorageSupport,
    indexedDB: indexedDBSupport,
  };
}
