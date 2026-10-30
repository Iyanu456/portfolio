import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const requestHeaders = await headers();
  const country = (requestHeaders.get("x-vercel-ip-country") || requestHeaders.get("cf-ipcountry") || requestHeaders.get("x-country-code") || "").toUpperCase();
  return NextResponse.json({ country: country || null, currency: country && country !== "NG" ? "USD" : "NGN", source: country ? "edge-country-header" : "default" }, { headers: { "Cache-Control": "no-store" } });
}
