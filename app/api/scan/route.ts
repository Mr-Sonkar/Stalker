import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runPrivacyScan } from "@/lib/scanner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawTarget = body.email || body.query || "";
    const email = String(rawTarget).trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          error: "Invalid email address",
          message: "Please provide a valid email address (e.g., name@domain.com).",
        },
        { status: 400 }
      );
    }

    // 1. Run the privacy scanning engines
    const report = await runPrivacyScan(email);

    // 2. Ensure a record exists for this user in Prisma SQLite
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split("@")[0],
      },
    });

    // 3. Persist the scan result in the database
    const savedScan = await prisma.scanResult.create({
      data: {
        userId: user.id,
        type: "EMAIL_PRIVACY_AUDIT",
        resultJson: JSON.stringify(report),
      },
    });

    return NextResponse.json(
      {
        success: true,
        scanId: savedScan.id,
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
