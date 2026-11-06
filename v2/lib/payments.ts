import { createHmac, timingSafeEqual } from "node:crypto";
import { getCollection } from "@/lib/mongodb";
import type { Document } from "mongodb";
import { notifyOwner, sendEmail, emailShell, escapeHtml } from "@/lib/email";

type SupportPayment = Document & {
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  currency: "NGN" | "USD";
  email: string;
  purpose: string;
  source?: "website" | "substack";
  slug: string;
  postTitle: string;
  tierLabel: string;
  createdAt: Date;
  paidAt?: Date;
  paystackTransactionId?: number;
  thankYouEmailSent?: boolean;
  ownerNotified?: boolean;
};

export async function getSupportPayments() {
  const payments = await getCollection<SupportPayment>("support_payments");
  await payments.createIndex({ reference: 1 }, { unique: true });
  await payments.createIndex({ status: 1, createdAt: -1 });
  return payments;
}

export function verifyPaystackSignature(rawBody: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function verifyAndRecordPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured.");

  const payments = await getSupportPayments();
  let payment = await payments.findOne({ reference });

  // Always verify directly with Paystack. A browser redirect alone is never proof of payment.
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.status || !result?.data) {
    throw new Error(result?.message || "Paystack could not verify this payment. Please try again.");
  }

  const transaction = result.data as {
    status?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    id?: number;
    paid_at?: string;
    customer?: { email?: string };
    metadata?: { purpose?: string; source?: "website" | "substack"; slug?: string; postTitle?: string; tierLabel?: string };
  };

  if (transaction.reference !== reference) {
    throw new Error("The reference returned by Paystack did not match this payment.");
  }
  if (transaction.status !== "success") {
    return { success: false, status: transaction.status || "pending" };
  }

  // Recover a successful Paystack payment if the pending MongoDB record is missing
  // (for example, after a local database/environment switch). Paystack remains the
  // source of truth, and recovery only happens after its API confirms success.
  if (!payment) {
    const email = String(transaction.customer?.email || "").trim().toLowerCase();
    const currency = transaction.currency;
    const amount = Number(transaction.amount) / 100;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (currency !== "NGN" && currency !== "USD") ||
        !Number.isFinite(amount) || amount <= 0) {
      throw new Error("Paystack confirmed the transaction, but its receipt details were incomplete. Please contact the site owner with your payment reference.");
    }

    const metadata = transaction.metadata || {};
    const now = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
    const recoveredPayment: SupportPayment = {
      reference,
      status: "SUCCESS",
      amount,
      currency,
      email,
      purpose: metadata.purpose === "article" ? "article" : "publication",
      source: metadata.source === "substack" ? "substack" : "website",
      slug: String(metadata.slug || "").slice(0, 180),
      postTitle: String(metadata.postTitle || "").slice(0, 180),
      tierLabel: String(metadata.tierLabel || "Contribution").slice(0, 80),
      createdAt: now,
      paidAt: now,
      paystackTransactionId: transaction.id,
      recoveredFromPaystack: true,
    };
    try {
      await payments.insertOne(recoveredPayment);
    } catch {
      // Another verification request or webhook may have recovered it concurrently.
    }
    payment = await payments.findOne({ reference });
    if (!payment) {
      throw new Error("Paystack confirmed the payment, but we couldn't save its receipt. Please try checking again.");
    }
  } else if (
    transaction.currency !== payment.currency ||
    Number(transaction.amount) !== Math.round(payment.amount * 100)
  ) {
    throw new Error("The verified payment amount or currency does not match the original request.");
  }

  const updated = await payments.updateOne({ reference, status: { $ne: "SUCCESS" } }, {
    $set: {
      status: "SUCCESS",
      paidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
      paystackTransactionId: transaction.id,
    },
  });

  if (updated.modifiedCount > 0 || payment.status === "SUCCESS") {
    const amountLabel = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: payment.currency,
      maximumFractionDigits: 2,
    }).format(payment.amount);

    // Claim each notification atomically so the browser return URL and Paystack
    // webhook cannot send duplicate thank-you emails when they arrive together.
    const thankYouClaim = payment.thankYouEmailSent === true
      ? null
      : await payments.updateOne(
          { reference, thankYouEmailSent: { $ne: true }, thankYouEmailSending: { $ne: true } },
          { $set: { thankYouEmailSending: true } },
        );
    if (thankYouClaim?.modifiedCount) {
      const supportHtml = emailShell(`<h1 style="font-size:28px;line-height:1.2">Thank you for the coffee.</h1><p style="font-size:15px;line-height:1.8;color:#555">Your contribution of <strong>${escapeHtml(amountLabel)}</strong> has been confirmed. It genuinely means a lot. Thank you for making time for these ideas and helping me keep writing, researching, and sharing them.</p><p style="font-size:13px;color:#777">Payment reference: ${escapeHtml(reference)}</p><p><a href="${(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")}/shelf" style="display:inline-block;background:#22231f;color:#fff;padding:12px 18px;border-radius:24px;text-decoration:none">Back to the shelf</a></p>`);
      const supportResult = await sendEmail(
        { email: payment.email },
        "A little thank-you for the coffee ☕",
        supportHtml,
        `Thank you for the coffee. Your contribution of ${amountLabel} has been confirmed. It genuinely means a lot. Payment reference: ${reference}`,
      );
      await payments.updateOne(
        { reference },
        supportResult.sent
          ? { $set: { thankYouEmailSent: true, thankYouEmailSentAt: new Date() }, $unset: { thankYouEmailSending: "" } }
          : { $unset: { thankYouEmailSending: "" } },
      );
    }

    const ownerClaim = payment.ownerNotified === true
      ? null
      : await payments.updateOne(
          { reference, ownerNotified: { $ne: true }, ownerNotificationSending: { $ne: true } },
          { $set: { ownerNotificationSending: true } },
        );
    if (ownerClaim?.modifiedCount) {
      const ownerResult = await notifyOwner("A contribution was confirmed", emailShell(`<h1 style="font-size:24px">Someone supported the publication</h1><p style="line-height:1.7;color:#555"><strong>${escapeHtml(amountLabel)}</strong> from ${escapeHtml(payment.email)} has been confirmed${payment.postTitle ? ` for “${escapeHtml(payment.postTitle)}”` : ""}. Purpose: ${escapeHtml(payment.purpose)}. Reference: ${escapeHtml(reference)}.</p>`), `${amountLabel} from ${payment.email} confirmed. Reference: ${reference}.`);
      await payments.updateOne(
        { reference },
        ownerResult.sent
          ? { $set: { ownerNotified: true, ownerNotifiedAt: new Date() }, $unset: { ownerNotificationSending: "" } }
          : { $unset: { ownerNotificationSending: "" } },
      );
    }
  }

  const finalPayment = await payments.findOne({ reference }, { projection: { thankYouEmailSent: 1 } });
  return { success: true, amount: payment.amount, currency: payment.currency, purpose: payment.purpose, source: payment.source || "website", postTitle: payment.postTitle, thankYouEmailSent: finalPayment?.thankYouEmailSent === true };
}
