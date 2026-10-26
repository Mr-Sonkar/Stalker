import { MediaDevicesFingerprint } from "./types";

function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function getMediaDevicesFingerprint(): Promise<MediaDevicesFingerprint> {
  let audioInputCount = 0;
  let audioOutputCount = 0;
  let videoInputCount = 0;

  try {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === "function") {
      const devices = await navigator.mediaDevices.enumerateDevices();
      for (const d of devices) {
        if (d.kind === "audioinput") audioInputCount++;
        else if (d.kind === "audiooutput") audioOutputCount++;
        else if (d.kind === "videoinput") videoInputCount++;
      }
    }
  } catch {
    // Media devices enumeration blocked or unavailable
  }

  // Speech synthesis voices
  let voicesCount = 0;
  const voicesSample: string[] = [];

  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      let voices = window.speechSynthesis.getVoices();
      // On some browsers (like Chrome), voices load asynchronously
      if (voices.length === 0) {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), 300);
          window.speechSynthesis.onvoiceschanged = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        voices = window.speechSynthesis.getVoices();
      }

      voicesCount = voices.length;
      for (let i = 0; i < Math.min(voices.length, 5); i++) {
        voicesSample.push(`${voices[i].name} (${voices[i].lang})`);
      }
    }
  } catch {
    // Speech synthesis blocked
  }

  const hash = fastHash(
    `${audioInputCount}-${audioOutputCount}-${videoInputCount}-voices:${voicesCount}`
  );

  return {
    supported: true,
    audioInputCount,
    audioOutputCount,
    videoInputCount,
    voicesCount,
    voicesSample,
    hash,
  };
}
