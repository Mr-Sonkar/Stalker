import { NextRequest, NextResponse } from "next/server";
import { runPrivacyScan } from "@/lib/scanner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    let email = "";
    let fileData: { fileName: string; fileType: string; buffer: Buffer } | undefined;
    let bioText = "";
    let screenshotBuffer: Buffer | undefined;
    let screenshotMimeType: string | undefined;

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      email = String(formData.get("email") || formData.get("query") || "").trim().toLowerCase();
      bioText = String(formData.get("bioText") || "").trim();
      
      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        fileData = {
          fileName: file.name,
          fileType: file.type,
          buffer: Buffer.from(arrayBuffer)
        };
      }
      
      const screenshot = formData.get("screenshot") as File | null;
      if (screenshot && screenshot.size > 0) {
        const arrayBuffer = await screenshot.arrayBuffer();
        screenshotBuffer = Buffer.from(arrayBuffer);
        screenshotMimeType = screenshot.type;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      const rawTarget = body.email || body.query || "";
      email = String(rawTarget).trim().toLowerCase();
    }

    if (!email && !fileData && !bioText && !screenshotBuffer) {
      return NextResponse.json(
        {
          error: "No input provided",
          message: "Please provide an email, file, bio, or screenshot to scan.",
        },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          error: "Invalid email address",
          message: "Please provide a valid email address (e.g., name@domain.com).",
        },
        { status: 400 }
      );
    }

    // 1. Run the privacy scanning engines
    const report = await runPrivacyScan(email, fileData, bioText, screenshotBuffer, screenshotMimeType);

    // Zero-knowledge in-memory return (no database persistence of personal queries)
    return NextResponse.json(
      {
        success: true,
        scanId: report.id,
        report,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Scan error:", err);
    return NextResponse.json(
      {
        error: "Scan failed",
        message: err?.message || "An unexpected error occurred while executing the scan.",
      },
      { status: 500 }
    );
  }
}
