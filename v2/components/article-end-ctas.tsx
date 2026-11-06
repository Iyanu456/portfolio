"use client";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Check, Coffee, Mail, X } from "lucide-react";
import { openSupportModal } from "@/components/support-payment-modal";

const STORAGE_KEY = "iyanu-publication-subscribed";
export default function ArticleEndCtas() {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const genres = ["Architecture & space", "Technology & the future", "Faith", "Fiction", "Design & creativity", "Ideas & observations", "Culture", "Personal notes"];
  const [interests, setInterests] = useState<string[]>(["Ideas & observations"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSubscribed(true);
        setEmail(saved.includes("@") ? saved : "");
      }
      const reader = window.localStorage.getItem("iyanu-publication-reader");
      if (reader) {
        const data = JSON.parse(reader) as { email?: string; name?: string };
        if (data.email) setEmail((current) => current || data.email || "");
        if (data.name) setName(data.name);
      }
    } catch {
      /* Subscription still works when browser storage is unavailable. */
    }
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, website, interests }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not subscribe right now.");
      setSubscribed(true);
      setSuccess(result.message || "You're on the list.");
      try {
        window.localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
        window.localStorage.setItem(
          "iyanu-publication-reader",
          JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
          }),
        );
      } catch {
        /* Database subscription already succeeded. */
      }
      window.setTimeout(() => setOpen(false), 1800);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not subscribe right now.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="article-end-ctas mx-auto mt-3 max-w-[760px]"
      aria-label="Stay connected"
    >
      <div className="overflow-hidden rounded-2xl px-5 py-9 text-center sm:px-10 sm:py-11">
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[#11131a] sm:text-3xl">
          Enjoyed your read?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#697386] sm:text-base">
          {`You can support the next one with a coffee. Every little gesture helps keep the ideas flowing.`}
        </p>
        <button
          type="button"
          onClick={() => openSupportModal()}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B900] focus-visible:ring-offset-2"
        >
          <Coffee size={18} /> Buy me a coffee <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-300 px-4 py-4 sm:flex-row sm:px-5">
        {subscribed ? (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                You're on the list
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                The next piece will find its way to you.
              </span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <Mail size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                Rather get the next piece by email?
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Occasional writing, ideas, and rabbit holes. No noise.
              </span>
            </span>
          </div>
        )}
        {!subscribed && (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500"
          >
            Subscribe <ArrowUpRight size={14} />
          </button>
        )}
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[5000] flex items-end justify-center bg-neutral-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !busy) setOpen(false);
            }}
          >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-modal-title"
            className="w-full max-w-md rounded-t-2xl bg-[#FCFBF8] p-6 shadow-2xl sm:rounded-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F05A28]">
                  <Mail size={19} />
                </span>
                <h2
                  id="subscribe-modal-title"
                  className="mt-4 text-2xl font-semibold tracking-tight"
                >
                  A little more of this, in your inbox.
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  New writing when it’s published. No spam, and you can leave
                  whenever you like.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close subscribe dialog"
                onClick={() => !busy && setOpen(false)}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>
            {success ? (
              <p
                role="status"
                className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
              >
                <Check size={17} />
                {success}
              </p>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <div
                  aria-hidden="true"
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                >
                  <label>
                    Leave this field empty
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </label>
                </div>
                <label className="block text-xs font-medium text-neutral-700">
                  Name{" "}
                  <span className="font-normal text-neutral-400">
                    (optional)
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#F05A28]"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-700">
                  Email address
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={254}
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#F05A28]"
                    placeholder="you@example.com"
                  />
                </label>
                <fieldset className="rounded-xl border border-neutral-200 p-3">
                  <legend className="px-1 text-xs font-medium text-neutral-700">What would you like to read about?</legend>
                  <p className="mb-3 text-[11px] text-neutral-500">Choose the topics you want in your inbox.</p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => { const checked = interests.includes(genre); return <button key={genre} type="button" aria-pressed={checked} onClick={() => setInterests((current: string[]) => checked ? current.filter(item => item !== genre) : [...current, genre])} className={`rounded-full border px-3 py-2 text-xs transition ${checked ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"}`}>{genre}</button>; })}
                  </div>
                </fieldset>
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#22231F] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#F05A28] disabled:opacity-50"
                >
                  {busy ? "Adding you…" : "Subscribe to new writing"}
                  <ArrowUpRight size={15} />
                </button>
                <p className="text-center text-[11px] leading-5 text-neutral-400">
                  By subscribing, you agree to receive new article emails.
                  Unsubscribe any time.
                </p>
              </form>
            )}
          </section>
          </div>,
          document.body,
        )}
    </section>
  );
}
