import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Extract IP from standard proxy headers or fallback
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"; // Default for local dev without proxies

  return NextResponse.json({ ip });
}
