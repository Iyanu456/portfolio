"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, RefreshCw, XCircle } from "lucide-react";

type Result = {
  success?: boolean;
  amount?: number;
  currency?: "NGN" | "USD";
  error?: string;
  status?: string;
  thankYouEmailSent?: boolean;
};

export default function PaymentVerification({
  reference,
  returnTo,
}: { reference: string; returnTo?: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    if (!reference) {
      setResult({ error: "No payment reference was provided." });
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setResult(null);

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We couldn't verify the payment.");
        return data as Result;
      })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((error) => {
        if (active) {
          setResult({
            error: error instanceof Error
              ? error.message
              : "We couldn't verify the payment. Please try again.",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reference, retryCount]);

  const money = result?.amount && result.currency
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: result.currency,
        maximumFractionDigits: 2,
      }).format(result.amount)
    : "";

  const notConfirmed = !loading && !result?.success;

  useEffect(() => {
    if (!returnTo || !result?.success) return;
    if (redirectCountdown <= 0) {
      window.location.assign(returnTo);
      return;
    }
    const timer = window.setTimeout(() => {
      setRedirectCountdown((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [returnTo, result?.success, redirectCountdown]);

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      {loading ? (
        <>
          <LoaderCircle size={34} className="animate-spin text-[#F05A28]" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Verifying your payment…</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            We’re checking the transaction directly with Paystack. Please keep this page open for a moment.
          </p>
        </>
      ) : result?.success ? (
        <>
          <div className="payment-thankyou-mark" aria-hidden="true">
            <CheckCircle2 size={42} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#F05A28]">Payment confirmed</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{returnTo ? "Thank you for supporting the writing." : "You’re funding the lore. ✨"}</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            Thank you for contributing {money}. Your support means a lot and helps keep the writing going.
          </p>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            {result.thankYouEmailSent
              ? "A thank-you note is on its way to your inbox."
              : "Your payment is confirmed. If the thank-you email doesn't arrive shortly, please check your spam folder."}
          </p>
          <p className="mt-3 break-all text-xs text-neutral-400">Reference: {reference}</p>
          {returnTo && (
            <p className="mt-4 text-xs text-neutral-500">Returning you to Substack in {redirectCountdown} seconds…</p>
          )}
        </>
      ) : (
        <>
          <XCircle size={42} className="text-neutral-400" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {result?.status && result.status !== "success"
              ? "Your payment is still being processed."
              : "We couldn’t confirm that payment yet."}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-7 text-neutral-600">
            {result?.error ||
              (result?.status
                ? `Paystack currently reports the transaction status as “${result.status}”. If you completed payment, you can safely check again in a moment.`
                : "The payment may have succeeded while the confirmation request was interrupted. Check again before trying to pay a second time.")}
          </p>
          <p className="mt-3 break-all text-xs text-neutral-400">Reference: {reference || "Not provided"}</p>
          {notConfirmed && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:border-neutral-500 hover:bg-neutral-50"
            >
              <RefreshCw size={15} />
              Check payment again
            </button>
          )}
        </>
      )}

      {returnTo && result?.success ? (
        <a href={returnTo}
          className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#F05A28]">
          Return to Substack now
        </a>
      ) : <Link
        href="/shelf"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#F05A28]"
      >
        Back to the shelf
      </Link>}
    </div>
  );
}
