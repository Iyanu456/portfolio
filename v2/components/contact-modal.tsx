"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, Send, X } from "lucide-react";

export function openContactModal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("iyanu:open-contact"));
}

export function ContactTrigger({
  children = "Get in touch",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={openContactModal} className={className}>
      {children}
    </button>
  );
}

export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setError("");
      setSuccess("");
    };
    window.addEventListener("iyanu:open-contact", handleOpen);
    return () => window.removeEventListener("iyanu:open-contact", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, busy]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Your message couldn't be sent. Please try again.");
      setSuccess(data.message || "Your message has been sent. Thank you for reaching out.");
      setName("");
      setEmail("");
      setMessage("");
      setCompany("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#151515]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative max-h-[94dvh] w-full max-w-[500px] overflow-y-auto rounded-t-[28px] border border-white/70 bg-[#fffefa] shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:rounded-[28px]"
      >
        <div className="h-1.5 w-full bg-accent" />
        <button
          type="button"
          aria-label="Close contact form"
          onClick={() => !busy && setOpen(false)}
          disabled={busy}
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
        >
          <X size={17} />
        </button>

        <div className="p-5 sm:p-7">
          {success ? (
            <div className="py-7 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={27} />
              </span>
              <h2 id="contact-modal-title" className="mt-5 text-2xl font-semibold tracking-tight text-[#171923]">
                Thanks for reaching out.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-neutral-500">{success}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-white transition hover:bg-accent"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Mail size={19} />
              </span>
              <h2 id="contact-modal-title" className="mt-5 pr-10 text-2xl font-semibold tracking-[-0.04em] text-[#171923] sm:text-[28px]">
                Let's start a conversation.
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                Have a question, an idea, or something you'd like to discuss? Leave me a message.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-neutral-800">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="What should I call you?"
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-neutral-800">Email address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-neutral-800">Your message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write whatever's on your mind..."
                    className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  />
                  <p className="mt-1 text-right text-[11px] text-neutral-400">{message.length}/5000</p>
                </div>

                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-company">Company</label>
                  <input id="contact-company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
                </div>

                {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {busy ? <><LoaderCircle size={16} className="animate-spin" /> Sending…</> : <>Send message <Send size={15} /></>}
                </button>
                <p className="text-center text-[11px] leading-5 text-neutral-400">I'll send a quick confirmation to your email when your message comes through.</p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
