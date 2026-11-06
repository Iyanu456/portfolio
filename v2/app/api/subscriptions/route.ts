import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getSubscribers, sendWelcomeEmail, notifyOwner, escapeHtml, emailShell } from "@/lib/email";

export const runtime = "nodejs";
const validEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const clean = (value: unknown, max: number) => String(value ?? "").trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, max);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  // Quietly discard obvious bot submissions without exposing a different response.
  if (String(body.website || "").trim()) return NextResponse.json({ ok: true, subscribed: true, message: "Thanks for your interest." });
  const name = clean(body.name, 80);
  const email = clean(body.email, 254).toLowerCase();
  const allowedGenres = ["Architecture & space", "Technology & the future", "Faith", "Fiction", "Design & creativity", "Ideas & observations", "Culture", "Personal notes"];
  const selectedInterests: string[] = Array.isArray(body.interests)
    ? body.interests
        .filter((item: unknown): item is string => typeof item === "string")
        .map((item: string) => clean(item, 60))
    : [];
  const interests = [...new Set(selectedInterests.filter((item) => allowedGenres.includes(item)))];
  if (!interests.length) return NextResponse.json({ error: "Choose at least one topic you are interested in." }, { status: 400 });
  if (!validEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (name.length > 0 && name.length < 2) return NextResponse.json({ error: "Your name should be at least two characters, or leave it blank." }, { status: 400 });
  try {
    const subscribers = await getSubscribers();
    const existing = await subscribers.findOne({ normalizedEmail: email });
    const token = existing?.unsubscribeToken || randomBytes(24).toString("hex");
    const now = new Date();
    await subscribers.updateOne(
      { normalizedEmail: email },
      { $set: { email, name, normalizedEmail: email, interests, status: "ACTIVE", unsubscribeToken: token, updatedAt: now, subscribedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    let welcomeEmailSent: boolean | null = null;
    if (!existing || existing.status !== "ACTIVE") {
      const subscriber = { email, name, unsubscribeToken: token };
      const [welcomeResult] = await Promise.all([
        sendWelcomeEmail(subscriber),
        notifyOwner("New publication subscriber", emailShell(`<h1 style="font-size:24px">A new reader subscribed</h1><p style="line-height:1.7;color:#555">${escapeHtml(name || "A reader")} (${escapeHtml(email)}) has joined the publication mailing list.</p>`), `${name || "A reader"} (${email}) subscribed.`)
      ]);
      welcomeEmailSent = welcomeResult.sent;
    }
    const message = existing?.status === "ACTIVE"
      ? "You're already on the list. Glad you're here."
      : welcomeEmailSent
        ? "You're on the list. Check your inbox for a welcome note."
        : "You're subscribed, but the welcome email couldn't be sent right now. Your subscription is saved.";
    return NextResponse.json({ ok: true, subscribed: true, message }, { status: 200 });
  } catch (error) {
    console.error("[subscriptions] Could not save subscriber:", error);
    return NextResponse.json({ error: "Subscriptions are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
