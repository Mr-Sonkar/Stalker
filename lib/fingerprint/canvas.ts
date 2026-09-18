export interface CanvasFingerprint {
  supported: boolean;
  dataUrl: string | null;
}

export function getCanvasFingerprint(): CanvasFingerprint {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return { supported: false, dataUrl: null };
    }

    // Standard canvas fingerprinting routine
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = "#069";
    ctx.fillText("Browser Fingerprinting 101", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Browser Fingerprinting 101", 4, 17);

    const dataUrl = canvas.toDataURL();
    return { supported: true, dataUrl };
  } catch (error) {
    return { supported: false, dataUrl: null };
  }
}
