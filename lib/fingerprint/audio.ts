export interface AudioFingerprint {
  supported: boolean;
  value: string | null;
}

export async function getAudioFingerprint(): Promise<AudioFingerprint> {
  try {
    const AudioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!AudioContext) {
      return { supported: false, value: null };
    }

    const context = new AudioContext(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    // Use some generic values
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.reduction.setValueAtTime(-20, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await context.startRendering();
    
    // We only need to sum some values to get a simple float fingerprint
    let sum = 0;
    const channelData = buffer.getChannelData(0);
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(channelData[i]);
    }

    return { supported: true, value: sum.toString() };
  } catch (error) {
    return { supported: false, value: null };
  }
}
