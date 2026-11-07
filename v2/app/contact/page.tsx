import type { Metadata } from "next";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import MotionReveal from "@/components/motion-reveal";
import ContactPageForm from "@/components/contact-page-form";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "oyerindei13@gmail.com";
const whatsappNumber = "2348098275080";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Iyanu, I’d love to get in touch.")}`;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Iyanu Oyerinde about a project, an idea, or just to say hello.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Iyanu Oyerinde",
    description: "Get in touch about a project, an idea, or just to say hello.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <section className="motion-page mx-auto min-h-[70vh] max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
      <MotionReveal className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
        <h1 className="mt-4 text-balance text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          Reach out to me<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
          Have a project in mind, a question, or just want to say hello? I’d love to hear from you.
        </p>
      </MotionReveal>

      <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:mt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)] lg:gap-12">
        <MotionReveal delay={70}>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">Send me a note</h2>
          <ContactPageForm />
        </MotionReveal>

        <MotionReveal delay={120} className="lg:pt-1">
          <div className="rounded-2xl border border-line bg-[#f3f0e9] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Or reach me directly</p>
            <div className="mt-4 grid gap-3">
              <a href={`mailto:${contactEmail}`} className="group flex min-h-16 items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/70 px-4 py-3 transition hover:border-neutral-400 hover:bg-white">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f0e9] text-ink"><Mail size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">Email</span>
                  <span className="mt-0.5 block break-all text-xs leading-5 text-neutral-500">{contactEmail}</span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/70 px-4 py-3 transition hover:border-neutral-400 hover:bg-white">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f0e9] text-ink"><MessageCircle size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">WhatsApp</span>
                  <span className="mt-0.5 block text-xs leading-5 text-neutral-500">Usually the quickest way to reach me</span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
            <p className="mt-5 border-t border-neutral-200/80 pt-4 text-sm leading-6 text-neutral-500">
              I’ll get back to you as soon as I can. Looking forward to hearing what you’re thinking about.
            </p>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
