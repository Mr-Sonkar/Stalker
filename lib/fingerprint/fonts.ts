import { FontFingerprint } from "./types";

const TARGET_FONTS = [
  // Windows Core & Common
  "Calibri",
  "Segoe UI",
  "Consolas",
  "Cambria",
  "Constantia",
  "Corbel",
  "Franklin Gothic Medium",
  "Gabriola",
  "Georgia",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Malgun Gothic",
  "Meiryo",
  "Microsoft JhengHei",
  "Microsoft YaHei",
  "MS Gothic",
  "MS PGothic",
  "Palatino Linotype",
  "Segoe Script",
  "Sitka Text",
  "Sylfaen",
  "Trebuchet MS",
  "Verdana",
  "Yu Gothic",

  // macOS & iOS Core
  "San Francisco",
  "Helvetica Neue",
  "Menlo",
  "Monaco",
  "Avenir",
  "Avenir Next",
  "Baskerville",
  "Chalkboard",
  "Didot",
  "Futura",
  "Geneva",
  "Gill Sans",
  "Helvetica",
  "Optima",
  "PingFang SC",
  "Thonburi",
  "Zapfino",

  // Linux / X11 / Android
  "Ubuntu",
  "DejaVu Sans",
  "DejaVu Sans Mono",
  "Liberation Sans",
  "Liberation Mono",
  "Nimbus Roman",
  "FreeSans",
  "Cantarell",
  "Noto Sans",
  "Droid Sans",
  "Roboto",

  // Developer & Specialty
  "Fira Code",
  "JetBrains Mono",
  "Cascadia Code",
  "Source Code Pro",
  "Comic Sans MS",
  "Courier New",
];

function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getFontFingerprint(): FontFingerprint {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { supported: false, detectedFonts: [], totalTested: 0, hash: "unsupported" };
    }

    const testString = "mmmmmmmmmmlliWW10O?~@#$";
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const baseWidths: Record<string, number> = {};

    for (const base of baseFonts) {
      ctx.font = `72px ${base}`;
      baseWidths[base] = ctx.measureText(testString).width;
    }

    const detectedFonts: string[] = [];

    for (const font of TARGET_FONTS) {
      let isDetected = false;
      for (const base of baseFonts) {
        ctx.font = `72px '${font}', ${base}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidths[base]) {
          isDetected = true;
          break;
        }
      }

      if (isDetected) {
        detectedFonts.push(font);
      }
    }

    const hash = fastHash(detectedFonts.sort().join(","));

    return {
      supported: true,
      detectedFonts,
      totalTested: TARGET_FONTS.length,
      hash,
    };
  } catch {
    return { supported: false, detectedFonts: [], totalTested: 0, hash: "error" };
  }
}
