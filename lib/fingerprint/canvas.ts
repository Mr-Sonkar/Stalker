import { CanvasFingerprint } from "./types";

function renderCanvas(canvas: HTMLCanvasElement): string {
  canvas.width = 280;
  canvas.height = 60;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Text baseline & background gradient
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial', sans-serif";
  ctx.textBaseline = "alphabetic";

  const linearGrad = ctx.createLinearGradient(0, 0, 280, 0);
  linearGrad.addColorStop(0, "#f97316");
  linearGrad.addColorStop(0.5, "#6366f1");
  linearGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = linearGrad;
  ctx.fillRect(100, 2, 80, 24);

  // 2. Complex path with subpixel curves and winding
  ctx.beginPath();
  ctx.arc(50, 30, 20, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = "rgba(16, 185, 129, 0.75)";
  ctx.fill();

  // 3. Text with shadow and emojis (tests OS font rasterization & emoji fonts)
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "#1e1b4b";
  ctx.fillText("🛡️ Stalker.OSINT 102.99 🚀", 4, 25);

  // 4. Overlapping semi-transparent text to force alpha blending
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(236, 72, 153, 0.7)";
  ctx.font = "16px 'Times New Roman', serif";
  ctx.fillText("Deep.Canvas.Probing.v2", 15, 48);

  return canvas.toDataURL();
}

// Fast string hash for local fingerprinting
function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getCanvasFingerprint(): CanvasFingerprint {
  try {
    const canvas1 = document.createElement("canvas");
    const dataUrl1 = renderCanvas(canvas1);

    if (!dataUrl1) {
      return { supported: false, dataUrl: null, hash: "unsupported", isTampered: false };
    }

    // Dual-render test: Detects dynamic noise injection (e.g. Brave Shields Farbling or Canvas Defender)
    const canvas2 = document.createElement("canvas");
    const dataUrl2 = renderCanvas(canvas2);

    const isTampered = dataUrl1 !== dataUrl2;
    const hash = fastHash(dataUrl1);

    return {
      supported: true,
      dataUrl: dataUrl1,
      hash,
      isTampered,
    };
  } catch {
    return { supported: false, dataUrl: null, hash: "error", isTampered: false };
  }
}
