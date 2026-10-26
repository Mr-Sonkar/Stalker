export interface ScreenFingerprint {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  devicePixelRatio: number;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
}

export function getScreenFingerprint(): ScreenFingerprint {
  return {
    width: typeof window !== "undefined" ? window.screen.width : 0,
    height: typeof window !== "undefined" ? window.screen.height : 0,
    availWidth: typeof window !== "undefined" ? window.screen.availWidth : 0,
    availHeight: typeof window !== "undefined" ? window.screen.availHeight : 0,
    devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    colorDepth: typeof window !== "undefined" ? window.screen.colorDepth || 24 : 24,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    timezoneOffset: new Date().getTimezoneOffset(),
  };
}
