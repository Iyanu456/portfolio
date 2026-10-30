"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Coffee,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Plus,
  X,
} from "lucide-react";

type Currency = "NGN" | "USD";
const PRESETS = [1];
const MAX_COFFEES = 100;
export function openSupportModal() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("iyanu:open-support"));
}

export default function SupportPaymentModal() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [currencyReady, setCurrencyReady] = useState(false);
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const coffeePrice = currency === "NGN" ? 1500 : 3;
  const symbol = currency === "NGN" ? "₦" : "$";
  const parsedCustomAmount = Number(customAmount);
  const finalAmount = customMode
    ? parsedCustomAmount
    : coffeePrice * coffeeCount;
  const minAmount = currency === "NGN" ? 1000 : 2;
  const maxAmount = currency === "NGN" ? 500000 : 5000;
  const amountValid =
    Number.isFinite(finalAmount) &&
    finalAmount >= minAmount &&
    finalAmount <= maxAmount &&
    (currency === "NGN"
      ? Number.isInteger(finalAmount)
      : Math.round(finalAmount * 100) === finalAmount * 100);
  const formatAmount = (amount: number) =>
    `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const formattedAmount = useMemo(
    () => formatAmount(Number.isFinite(finalAmount) ? finalAmount : 0),
    [finalAmount, currency],
  );

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setError("");
      setBusy(false);
      setCoffeeCount(1);
      setCustomMode(false);
      setCustomAmount("");
    };
    window.addEventListener("iyanu:open-support", handleOpen);
    try {
      const saved = window.localStorage.getItem("iyanu-publication-reader");
      if (saved) {
        const reader = JSON.parse(saved) as { email?: string };
        if (reader.email) setEmail(reader.email);
      }
    } catch {
      /* Email can be entered manually. */
    }
    void fetch("/api/payments/currency", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCurrency(data.currency === "USD" ? "USD" : "NGN"))
      .catch(() => setCurrency("NGN"))
      .finally(() => setCurrencyReady(true));
    return () => window.removeEventListener("iyanu:open-support", handleOpen);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!currencyReady) {
      setError("Getting your local pricing. Please try again in a moment.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email to continue.");
      return;
    }
    if (!amountValid) {
      setError(
        currency === "NGN"
          ? "Enter a whole amount like ₦1,000 or more"
          : "Enter an amount like $2 or more, with up to two decimal places.",
      );
      return;
    }
    setBusy(true);
    try {
      const label = customMode
        ? `Custom contribution (${formatAmount(finalAmount)})`
        : `${coffeeCount} ${coffeeCount === 1 ? "coffee" : "coffees"}`;
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currency,
          amount: finalAmount,
          purpose: "publication",
          slug: "",
          postTitle: "",
          tierLabel: label,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.authorizationUrl)
        throw new Error(data.error || "Could not open checkout.");
      try {
        window.localStorage.setItem(
          "iyanu-publication-reader",
          JSON.stringify({ email: email.trim().toLowerCase() }),
        );
      } catch {
        /* Payment can proceed without storage. */
      }
      window.location.assign(data.authorizationUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start payment. Please try again.",
      );
      setBusy(false);
    }
  }

  if (!open) return null;
  return (
    <div
      className="fixed z-40  inset-0 flex items-end justify-center bg-[#151515]/55 p-0 backdrop-blur-md sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) setOpen(false);
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        aria-describedby="support-modal-description"
        className="relative max-h-[94dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[30px] border border-white/70 bg-[#fffefa] shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:rounded-[30px] z-50"
      >
        <div className="h-1.5 w-full bg-accent" />
        <button
          type="button"
          aria-label="Close support dialog"
          onClick={() => !busy && setOpen(false)}
          className="z-40 absolute hover:cursor-pointer right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-40"
          disabled={busy}
        >
          <X size={17} />
        </button>
        <form onSubmit={submit} className=" p-5 lg:p-7 ">
          <div >
            
        
             
              <h2
                id="support-modal-title"
                className="mt-1 text-lg lg:text-2xl font-extrabold leading-tight tracking-[-0.055em] text-[#171923]"
              >
                Buy me a coffee
              </h2>
          
          </div>
          <p
            id="support-modal-description"
            className="mt-4 max-w-[82%] text-[0.86em] leading-[1.3em] text-neutral-500"
          >
            {`Thank you for being here. Pick a coffee (or a few) and help fuel the next thing I write!`}
          </p>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-[#F8F8F6] p-4 sm:p-5">
            
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-3 sm:flex-nowrap sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                <Coffee size={22} />
              </span>
              <span className="text-sm font-semibold text-neutral-400">×</span>
              {/*<div className="flex min-w-0 flex-1 items-center gap-1.5">
                {PRESETS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setCustomMode(false);
                      setCustomAmount("");
                      setCoffeeCount(count);
                      setError("");
                    }}
                    aria-pressed={!customMode && coffeeCount === count}
                    className={`flex h-10 min-w-10 flex-1 items-center justify-center rounded-xl border text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3BC00] ${!customMode && coffeeCount === count ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"}`}
                  >
                    {count}
                  </button>
                ))}
              </div>*/}
              <div className="flex shrink-0 items-center gap-1 rounded-xl border border-neutral-200 bg-[#FAFAF8] p-1">
                <button
                  type="button"
                  aria-label="Remove one coffee"
                  onClick={() => {
                    setCustomMode(false);
                    setCustomAmount("");
                    setCoffeeCount((count) => Math.max(1, count - 1));
                    setError("");
                  }}
                  disabled={customMode || coffeeCount <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-5 text-center text-sm font-bold tabular-nums">
                  {customMode ? "—" : coffeeCount}
                </span>
                <button
                  type="button"
                  aria-label="Add one coffee"
                  onClick={() => {
                    setCustomMode(false);
                    setCustomAmount("");
                    setCoffeeCount((count) => Math.min(MAX_COFFEES, count + 1));
                    setError("");
                  }}
                  disabled={customMode || coffeeCount >= MAX_COFFEES}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label
                htmlFor="support-custom-amount"
                className="mb-1.5 block text-xs mt-4 font-bold text-neutral-800"
              >
                Custom amount{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <div
                
              >
               
                <input
                  id="support-custom-amount"
                  type="number"
                  inputMode="numeric"
                  min={minAmount}
                  max={maxAmount}
                  step={currency === "NGN" ? 1 : 0.01}
                  value={customAmount}
                  onChange={(event) => {
                    const next = event.target.value;
                    setCustomAmount(next);
                    setCustomMode(next.trim().length > 0);
                    setError("");
                  }}
                  placeholder={
                    currency === "NGN"
                      ? "Enter any amount"
                      : "Enter any amount"
                  }
                  className={`mt-2 h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400  flex items-center rounded-xl border bg-white px-3.5 transition focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 ${customMode ? "border-neutral-900" : "border-neutral-200"}`}
                />
                
              </div>
             
            </div>
          </div>

        

          <div className="mt-4">
            <label
              htmlFor="support-email"
              className="block text-xs font-bold text-neutral-800"
            >
              Email
            </label>
            <input
              id="support-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !currencyReady || (customMode && !amountValid)}
            className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#9c3f01] transition hover:-translate-y-0.5 hover:bg-[#f26100] hover:shadow-[0_5px_0_#9c3f01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55 disabled:hover:translate-y-0"
          >
            {busy ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Processing…
              </>
            ) : !currencyReady ? (
              "Loading payment options…"
            ) : (
              <>
                Continue · {formattedAmount}
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <LockKeyhole size={11} /> Secure checkout by Paystack{" "}
            <span aria-hidden="true">·</span> One-time payment
          </p>
        </form>
      </section>
    </div>
  );
}
