import { NextRequest, NextResponse } from "next/server";
import { checkEmailBreaches } from "@/lib/hibp/email";

// Simple in-memory rate limiting (for demo/development purposes)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  try {
    // 1. Basic Rate Limiting by IP (or fallback to a global bucket if IP isn't available)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    if (now - rateData.timestamp > RATE_LIMIT_WINDOW_MS) {
      rateData.count = 1;
      rateData.timestamp = now;
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
    rateLimitMap.set(ip, rateData);

    // 2. Parse Body
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // 3. Fetch from HIBP
    const breaches = await checkEmailBreaches(email);

    return NextResponse.json({ breaches });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Breach check error:", err);
    if (err?.message?.includes("429")) {
      return NextResponse.json({ error: "Rate Limit Exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to check breaches" }, { status: 500 });
  }
}
