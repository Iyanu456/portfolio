"use client";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
export default function SubscriptionStatusSync() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("unsubscribed");
    if (!status) return;
    try { window.localStorage.removeItem("iyanu-publication-subscribed"); } catch { /* Storage may be disabled. */ }
    setMessage(status === "1" ? "You’ve been unsubscribed. You can subscribe again any time." : "You’re already unsubscribed.");
    url.searchParams.delete("unsubscribed");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  if (!message) return null;
  return <div role="status" className="fixed bottom-4 left-4 right-4 z-[160] mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-xl"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600"/><p className="flex-1 leading-6">{message}</p><button type="button" aria-label="Dismiss notification" onClick={() => setMessage("")} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100"><X size={15}/></button></div>;
}
