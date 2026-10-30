import { NextResponse } from "next/server";
import { verifyAndRecordPayment } from "@/lib/payments";

export const runtime = "nodejs";

function normalizeReference(request: Request): string {
  const params = new URL(request.url).searchParams;
  // Prefer the first reference query value. Defensively handle the previous
  // bug where duplicate values were joined into a comma-separated string.
  const candidates = [...params.getAll("reference"), ...params.getAll("trxref")];
  for (const candidate of candidates) {
    const reference = candidate.split(",")[0]?.trim() || "";
    if (reference) return reference;
  }
  return "";
}

export async function GET(request: Request) {
  const reference = normalizeReference(request);
  if (!reference || reference.length > 180) {
    return NextResponse.json(
      { error: "A valid payment reference is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    return NextResponse.json(await verifyAndRecordPayment(reference), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify this payment.";
    const status = /not configured/i.test(message)
      ? 503
      : /could not save|couldn't save|could not verify|paystack/i.test(message)
        ? 502
        : 400;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
