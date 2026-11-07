"use client";

import { useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("iyanu:open-design-contact", handleOpen);
    return () => window.removeEventListener("iyanu:open-design-contact", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#151515]/60 p-4 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="design-contact-title" className="relative w-full max-w-[440px] rounded-[26px] border border-white/70 bg-[#fffefa] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:p-8">
        <button type="button" aria-label="Close contact options" onClick={() => setOpen(false)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"><X size={17}/></button>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Let’s work together</p>
        <h2 id="design-contact-title" className="mt-3 pr-8 text-2xl font-semibold tracking-[-0.045em] text-[#171923] sm:text-[28px]">How would you like to reach me?</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Choose whichever works best for you. I’d love to hear what you have in mind.</p>
        <div className="mt-7 grid gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-[58px] items-center gap-3 rounded-xl bg-[#171923] px-4 text-white transition hover:-translate-y-0.5 hover:bg-[#292b35]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><MessageCircle size={18}/></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Continue on WhatsApp</span><span className="mt-0.5 block text-[11px] text-white/60">Usually the quickest way to reach me</span></span>
            <ArrowUpRight size={16}/>
          </a>
          <a href={emailUrl} className="flex min-h-[58px] items-center gap-3 rounded-xl border border-neutral-200 px-4 text-[#171923] transition hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100"><Mail size={18}/></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Send me an email</span><span className="mt-0.5 block text-[11px] text-neutral-500">{contactEmail}</span></span>
            <ArrowUpRight size={16}/>
          </a>
        </div>
      </section>
    </div>
  );
}
