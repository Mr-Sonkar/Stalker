import { calculateEntropy } from "../entropy";
import { detectTampering } from "../tamper";

describe("Deep Fingerprint Unit Tests", () => {
  it("should calculate Shannon entropy and rarity level correctly", () => {
    const report = calculateEntropy({
      canvas: { supported: true, dataUrl: "data:...", hash: "abc12345", isTampered: false },
      webgl: {
        supported: true,
        vendor: "Google Inc. (NVIDIA)",
        renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0)",
        version: "WebGL 2.0",
        shadingLanguageVersion: "WebGL GLSL ES 3.00",
        extensions: ["EXT_color_buffer_float", "OES_texture_float"],
        maxTextureSize: 16384,
        maxRenderBufferSize: 16384,
        maxViewportDims: [16384, 16384],
        vertexShaderPrecision: 23,
        fragmentShaderPrecision: 23,
        antialias: true,
        renderHash: "webgl_hash",
      },
      audio: { supported: true, value: "124.043", sampleRate: 44100, channelCount: 1, isTampered: false },
      fonts: { supported: true, detectedFonts: ["Segoe UI", "Calibri", "Consolas", "Arial"], totalTested: 55, hash: "fonthash" },
      media: { supported: true, audioInputCount: 1, audioOutputCount: 2, videoInputCount: 1, voicesCount: 4, voicesSample: [], hash: "mediahash" },
      screenDimensions: "1920x1080",
      languagesCount: 2,
    });

    expect(report.totalBits).toBeGreaterThan(12);
    expect(report.uniquenessPercentage).toBeGreaterThan(99.0);
    expect(["RARE", "HIGHLY_UNIQUE"]).toContain(report.rarityLevel);
  });

  it("should detect active noise injection defenses", async () => {
    const tamper = await detectTampering(true, false);
    expect(tamper.canvasNoiseDetected).toBe(true);
    expect(tamper.protectionScore).toBeGreaterThanOrEqual(45);
    expect(["PARTIALLY_PROTECTED", "ACTIVELY_DEFENDED"]).toContain(tamper.defenseStatus);
    expect(tamper.notes.some(n => n.includes("Canvas Farbling"))).toBe(true);
  });

  it("should flag clean standard browser environment", async () => {
    const tamper = await detectTampering(false, false);
    expect(tamper.canvasNoiseDetected).toBe(false);
    expect(tamper.audioNoiseDetected).toBe(false);
    expect(tamper.protectionScore).toBe(0);
    expect(tamper.defenseStatus).toBe("STANDARD_EXPOSURE");
  });
});
