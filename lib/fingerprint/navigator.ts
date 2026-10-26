export interface NavigatorFingerprint {
  userAgent: string;
  languages: string[];
  doNotTrack: string | null;
  cookiesEnabled: boolean;
  platform: string;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
}

export function getNavigatorFingerprint(): NavigatorFingerprint {
  return {
    userAgent: navigator.userAgent || "Unknown",
    languages: Array.from(navigator.languages || []),
    doNotTrack: navigator.doNotTrack || null,
    cookiesEnabled: navigator.cookieEnabled || false,
    platform: (navigator as any).userAgentData?.platform || navigator.platform || "Unknown",
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: (navigator as any).deviceMemory || null,
  };
}
