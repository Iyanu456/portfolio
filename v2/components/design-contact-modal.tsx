"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mail, MessageCircle, X, ArrowUpRight } from "lucide-react";

const whatsappNumber = "2348098275080";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "oyerindei13@gmail.com";
const enquiryMessage = "Hi Iyanu, I came across your design work and would love to discuss a project with you. Are you available to chat?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(enquiryMessage)}`;
const emailUrl = `mailto:${contactEmail}?subject=${encodeURIComponent("Design project enquiry")}&body=${encodeURIComponent(enquiryMessage)}`;

export function openDesignContactModal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("iyanu:open-design-contact"));
}

export function DesignContactTrigger({ children = "Get in touch", className = "" }: { children?: ReactNode; className?: string }) {
  return <button type="button" onClick={openDesignContactModal} className={className}>{children}</button>;
}

export default function DesignContactModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("iyanu:open-design-contact", handleOpen);
    return () => window.removeEventListener("iyanu:open-design-contact", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keydown", handleTab);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#151515]/60 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-contact-title"
        aria-describedby="design-contact-description"
        className="relative max-h-[min(90dvh,38rem)] w-full max-w-[460px] overflow-y-auto rounded-[24px] border border-white/70 bg-[#fffefa] shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:rounded-[26px]"
      >
        <div className="h-1.5 w-full bg-accent" />
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close contact options"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X size={17} />
        </button>
        <div className="p-5 pt-6 sm:p-7 sm:pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Let’s work together</p>
          <h2 id="design-contact-title" className="mt-3 max-w-[19rem] pr-8 text-[1.65rem] font-semibold leading-tight tracking-[-0.045em] text-[#171923] sm:text-[30px]">
            How would you like to reach me?
          </h2>
          <p id="design-contact-description" className="mt-3 max-w-sm text-sm leading-6 text-neutral-600">
            Choose whichever works best for you. I’d love to hear what you have in mind.
          </p>
          <div className="mt-6 grid gap-3 sm:mt-7">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-[76px] items-center gap-3 rounded-2xl bg-[#171923] px-4 py-3 text-white transition hover:-translate-y-0.5 hover:bg-[#292b35] focus-visible:outline-white sm:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"><MessageCircle size={19}/></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Continue on WhatsApp</span>
                <span className="mt-1 block text-xs leading-5 text-white/65">Usually the quickest way to reach me</span>
              </span>
              <ArrowUpRight className="shrink-0 text-white/65 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" size={17}/>
            </a>
            <a href={emailUrl} className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-[#171923] transition hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-accent sm:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3f0e9] text-[#171923]"><Mail size={19}/></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Send me an email</span>
                <span className="mt-1 block break-all text-xs leading-5 text-neutral-500">{contactEmail}</span>
              </span>
              <ArrowUpRight className="shrink-0 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-700" size={17}/>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
