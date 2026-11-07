"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

export default function ContactPageForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Your message couldn't be sent. Please try again.");
      }
      setSuccess(data.message || "Your message has been sent. Thanks for reaching out.");
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

  if (success) {
    return (
      <div role="status" className="rounded-2xl border border-neutral-200 bg-white/70 p-6 text-center sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={24} />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Message sent!</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{success}</p>
        <button type="button" onClick={() => setSuccess("")} className="mt-5 text-sm font-semibold text-accent underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white/70 p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-page-name" className="mb-1.5 block text-xs font-semibold text-neutral-800">Your name</label>
          <input
            id="contact-page-name"
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
          <label htmlFor="contact-page-email" className="mb-1.5 block text-xs font-semibold text-neutral-800">Email address</label>
          <input
            id="contact-page-email"
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
      </div>
      <div>
        <label htmlFor="contact-page-message" className="mb-1.5 block text-xs font-semibold text-neutral-800">Your message</label>
        <textarea
          id="contact-page-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell me a little about what’s on your mind..."
          className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-page-company">Company</label>
        <input id="contact-page-company" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-44"
      >
        {busy ? <><LoaderCircle size={16} className="animate-spin" /> Sending…</> : <>Send message <Send size={15} /></>}
      </button>
      <p className="text-xs leading-5 text-neutral-400">I’ll send a quick confirmation when your message comes through.</p>
    </form>
  );
}
