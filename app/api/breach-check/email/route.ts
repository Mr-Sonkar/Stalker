import { NextRequest, NextResponse } from "next/server";
import { checkEmailBreaches, BreachResult } from "@/lib/xposedornot/email";
import { checkDataBreaches } from "@/lib/scanner/breaches";

// Simple in-memory rate limiting (for demo/development purposes)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

export async function POST(req: NextRequest) {
  try {
    // 1. Basic Rate Limiting by IP
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

    // 3. Concurrent Multi-Source Breach Lookup (HIBP Primary + XposedOrNot Secondary)
    const [hibpRes, xonRes] = await Promise.allSettled([
      checkDataBreaches(email),
      checkEmailBreaches(email),
    ]);

    const hibpBreaches = hibpRes.status === "fulfilled" ? hibpRes.value : [];
    const xonBreaches = xonRes.status === "fulfilled" ? xonRes.value : [];

    // 4. Merge, normalize, and attribute sources
    const unifiedMap = new Map<string, BreachResult>();
    let hibpCount = 0;
    let xonCount = 0;
    let verifiedByBoth = 0;

    for (const b of hibpBreaches) {
      hibpCount++;
      const key = (b.domain || b.name).toLowerCase().trim();
      unifiedMap.set(key, {
        name: b.name,
        title: b.name,
        domain: b.domain,
        breachDate: b.breachDate,
        addedDate: new Date().toISOString(),
        affectedAccounts: b.pwnCount || 0,
        verified: b.isVerified,
        sensitive: false,
        dataClasses: b.dataClasses,
        sources: ["HIBP"],
      });
    }

    for (const b of xonBreaches) {
      xonCount++;
      const key = (b.domain || b.name).toLowerCase().trim();
      if (unifiedMap.has(key)) {
        verifiedByBoth++;
        const existing = unifiedMap.get(key)!;
        unifiedMap.set(key, {
          ...existing,
          dataClasses: Array.from(new Set([...existing.dataClasses, ...b.dataClasses])),
          sources: ["HIBP", "XposedOrNot"],
        });
      } else {
        unifiedMap.set(key, {
          ...b,
          sources: ["XposedOrNot"],
        });
      }
    }

    const breaches = Array.from(unifiedMap.values());

    return NextResponse.json({
      breaches,
      providerComparison: {
        hibpCount,
        xonCount,
        verifiedByBoth,
        totalUnique: breaches.length,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Breach check error:", err);
    if (err?.message?.includes("429")) {
      return NextResponse.json({ error: "Rate Limit Exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to check breaches" }, { status: 500 });
  }
}
