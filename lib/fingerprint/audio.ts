import { AudioDeepFingerprint } from "./types";

async function renderAudioBuffer(): Promise<{ sum: number; sampleRate: number } | null> {
  const AudioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext(1, 44100, 44100);
  const oscillator = context.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(10000, context.currentTime);

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-50, context.currentTime);
  compressor.knee.setValueAtTime(40, context.currentTime);
  compressor.ratio.setValueAtTime(12, context.currentTime);
  compressor.attack.setValueAtTime(0, context.currentTime);
  compressor.release.setValueAtTime(0.25, context.currentTime);

  oscillator.connect(compressor);
  compressor.connect(context.destination);
  oscillator.start(0);

  const buffer = await context.startRendering();
  const channelData = buffer.getChannelData(0);

  let sum = 0;
  for (let i = 4500; i < 5000; i++) {
    sum += Math.abs(channelData[i]);
  }

  return { sum, sampleRate: buffer.sampleRate };
}

export async function getAudioFingerprint(): Promise<AudioDeepFingerprint> {
  try {
    const res1 = await renderAudioBuffer();
    if (!res1) {
      return {
        supported: false,
        value: null,
        sampleRate: 0,
        channelCount: 0,
        isTampered: false,
      };
    }

    // Secondary test for audio farbling / noise injection
    const res2 = await renderAudioBuffer();
    const isTampered = res2 ? Math.abs(res1.sum - res2.sum) > 0.000000001 : false;

    return {
      supported: true,
      value: res1.sum.toFixed(10),
      sampleRate: res1.sampleRate,
      channelCount: 1,
      isTampered,
    };
  } catch {
    return {
      supported: false,
      value: null,
      sampleRate: 0,
      channelCount: 0,
      isTampered: false,
    };
  }
}
