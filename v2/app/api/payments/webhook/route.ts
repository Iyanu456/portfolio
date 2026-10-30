import { NextResponse } from "next/server";
import { verifyPaystackSignature, verifyAndRecordPayment } from "@/lib/payments";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";
  if (!verifyPaystackSignature(rawBody, signature, secret)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  let event: { event?: string; data?: { reference?: string } };
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (event.event === "charge.success" && event.data?.reference) {
    try {
      const verification = await verifyAndRecordPayment(event.data.reference);
      if (!verification.success) return NextResponse.json({ error: "Paystack has not confirmed this transaction yet." }, { status: 400 });
    } catch { return NextResponse.json({ error: "Payment verification failed." }, { status: 400 }); }
  }
  return NextResponse.json({ received: true });
}
