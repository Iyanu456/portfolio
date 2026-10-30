import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max = 180) => String(value ?? "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max);

export async function POST(request: Request) {
  // Never pollute production analytics with local development/testing traffic,
  // even when local development points at the same MongoDB database.
  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") || requestUrl.host;
  if (process.env.NODE_ENV !== "production" || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host) || host.endsWith(".local")) {
    return NextResponse.json({ ok: true, ignored: "development" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }
  const userAgent = request.headers.get("user-agent") || "";
  if (/(bot|crawler|spider|headless|preview|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot)/i.test(userAgent)) {
    return NextResponse.json({ ok: true, ignored: "automated-client" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const type = body.type;
  if (type !== "page_view" && type !== "click" && type !== "share" && type !== "read_milestone") return NextResponse.json({ ok: false }, { status: 400 });
  const path = clean(body.path, 300);
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/admin")) return NextResponse.json({ ok: false }, { status: 400 });
  const visitorId = clean(body.visitorId, 80);
  const sessionId = clean(body.sessionId, 100);
  if (!visitorId || !sessionId) return NextResponse.json({ ok: false }, { status: 400 });
  const slug = clean(body.slug, 180);
  const label = clean(body.label, 100);
  const target = clean(body.target, 300);
  const milestone = Number(body.milestone);
  if (type === "read_milestone" && ![25, 50, 75, 100].includes(milestone)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const events = await getCollection("analytics_events");
    if (type === "page_view") {
      const recentDuplicate = await events.findOne({ type, path, visitorId, createdAt: { $gte: new Date(Date.now() - 5000) } }, { projection: { _id: 1 } });
      if (recentDuplicate) return NextResponse.json({ ok: true, deduplicated: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
    }
    await events.insertOne({
      type, path, ...(slug ? { slug } : {}), ...(label ? { label } : {}), ...(target ? { target } : {}),
      ...(type === "read_milestone" ? { milestone } : {}), visitorId, sessionId,
      createdAt: new Date(), day: new Date().toISOString().slice(0, 10),
    });
    return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
