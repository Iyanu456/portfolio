import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupportPayments } from "@/lib/payments";

export const runtime = "nodejs";
const clean = (value: unknown, max = 180) => String(value ?? "").trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, max);
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Payments are not configured yet. Add PAYSTACK_SECRET_KEY to the server environment." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const email = clean(body.email, 254).toLowerCase();
  const currency = body.currency === "USD" ? ("USD" as const) : body.currency === "NGN" ? ("NGN" as const) : null;
  const amount = Number(body.amount);
  const purpose = body.purpose === "article" ? "article" : "publication";
  const slug = clean(body.slug, 180);
  const postTitle = clean(body.postTitle, 180);
  const tierLabel = clean(body.tierLabel, 80);
  if (!validEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (currency === null || !Number.isFinite(amount)) return NextResponse.json({ error: "Choose a valid currency and amount." }, { status: 400 });
  if (currency === "NGN" && (amount < 1000 || amount > 500000 || !Number.isInteger(amount))) return NextResponse.json({ error: "Naira contributions must be whole amounts between ₦1,000 and ₦500,000." }, { status: 400 });
  if (currency === "USD" && (amount < 2 || amount > 5000 || Math.round(amount * 100) !== amount * 100)) return NextResponse.json({ error: "Dollar contributions must be between $2 and $5,000, with up to two decimal places." }, { status: 400 });

  const reference = `iyanu_${randomUUID().replace(/-/g, "")}`;
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isLocalDevelopmentUrl = process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredSiteUrl || "");
  if (!configuredSiteUrl || (!/^https:\/\//i.test(configuredSiteUrl) && !isLocalDevelopmentUrl)) {
    return NextResponse.json({ error: "Set NEXT_PUBLIC_SITE_URL to your HTTPS domain. In local development only, http://localhost:3000 is also allowed." }, { status: 503 });
  }
  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  let payments: Awaited<ReturnType<typeof getSupportPayments>> | undefined;
  const record = { reference, status: "PENDING" as const, amount, currency, email, purpose, slug, postTitle, tierLabel, createdAt: new Date() };
  try {
    payments = await getSupportPayments();
    await payments.insertOne(record);
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({
        email, amount: Math.round(amount * 100), currency, reference,
        callback_url: `${siteUrl}/support/verify?reference=${encodeURIComponent(reference)}`,
        metadata: { purpose, slug, postTitle, tierLabel, custom_fields: [
          { display_name: "Contribution", variable_name: "contribution_tier", value: tierLabel || "Custom amount" },
          { display_name: "Publication", variable_name: "publication", value: "Iyanu Oyerinde — A place for ideas to take shape" }
        ] }
      })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.status || !result?.data?.authorization_url) {
      await payments.deleteOne({ reference, status: "PENDING" });
      return NextResponse.json({ error: result?.message || "Paystack could not start checkout. Check your account currency settings." }, { status: 502 });
    }
    return NextResponse.json({ authorizationUrl: result.data.authorization_url, reference });
  } catch {
    if (payments) await payments.deleteOne({ reference, status: "PENDING" }).catch(() => undefined);
    return NextResponse.json({ error: "Could not start payment. Check your database and Paystack configuration, then try again." }, { status: 503 });
  }
}
