import { NextResponse } from "next/server";
import { emailShell, escapeHtml, sendEmail, siteUrl } from "@/lib/email";

export const runtime = "nodejs";

const clean = (value: unknown, max: number) =>
  String(value ?? "").trim().replace(/\u0000/g, "").slice(0, max);
const validEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Lightweight per-instance throttling to discourage accidental rapid resubmissions.
const recentSubmissions = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (recentSubmissions.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS) {
    recentSubmissions.set(key, recent);
    return true;
  }
  recent.push(now);
  recentSubmissions.set(key, recent);
  return false;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) || {};

  // Honeypot: bots fill this hidden field; respond as if the message was accepted.
  if (String(body.company || "").trim()) {
    return NextResponse.json({ ok: true, message: "Thanks for getting in touch." });
  }

  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientKey = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "You've sent a few messages recently. Please try again in a little while." },
      { status: 429 },
    );
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 5000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Your message should be at least 10 characters." }, { status: 400 });
  }

  const ownerEmail = process.env.SITE_OWNER_EMAIL?.trim();
  if (!ownerEmail || !process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.error("[contact] SITE_OWNER_EMAIL and Brevo sender settings must be configured.");
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  const ownerHtml = emailShell(
    `<p style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#f05a28">New message</p>
     <h1 style="font-size:26px;line-height:1.2">Someone got in touch.</h1>
     <p style="font-size:14px;line-height:1.7;color:#555"><strong>From:</strong> ${safeName}<br /><strong>Email:</strong> ${safeEmail}</p>
     <div style="margin-top:22px;padding:18px;background:#faf9f6;border-radius:10px;font-size:15px;line-height:1.8;color:#333">${safeMessage}</div>
     <p style="font-size:12px;color:#888">Reply directly to this email to respond to ${safeName}.</p>`,
  );
  const confirmationHtml = emailShell(
    `<h1 style="font-size:26px;line-height:1.2">Your message is on its way.</h1>
     <p style="font-size:15px;line-height:1.8;color:#555">Hi ${safeName}, thanks for taking the time to write. I've received your message and will get back to you as soon as I can.</p>
     <p style="font-size:13px;line-height:1.7;color:#777">Here's a copy of what you sent:</p>
     <div style="margin-top:14px;padding:18px;background:#faf9f6;border-radius:10px;font-size:14px;line-height:1.8;color:#333">${safeMessage}</div>
     <p style="font-size:13px;line-height:1.7;color:#777">Thanks again,<br />Iyanu</p>`,
  );

  const ownerResult = await sendEmail(
    { email: ownerEmail, name: "Iyanu Oyerinde" },
    `New website message from ${name}`,
    ownerHtml,
    `New message from ${name} (${email}):\n\n${message}`,
    { replyTo: { email, name } },
  );

  if (!ownerResult.sent) {
    return NextResponse.json(
      { error: "Your message couldn't be sent just now. Please try again shortly." },
      { status: 503 },
    );
  }

  const confirmationResult = await sendEmail(
    { email, name },
    "Thanks for getting in touch — Iyanu Oyerinde",
    confirmationHtml,
    `Hi ${name}, thanks for taking the time to write. I've received your message and will get back to you as soon as I can.\n\nYour message:\n${message}\n\n${siteUrl}`,
  );

  return NextResponse.json({
    ok: true,
    confirmationEmailSent: confirmationResult.sent,
    message: confirmationResult.sent
      ? "Your message has been sent. A confirmation is on its way to your inbox."
      : "Your message has been sent, but we couldn't send the confirmation email. Thank you for reaching out.",
  });
}
