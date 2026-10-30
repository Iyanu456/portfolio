import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import MotionReveal from "@/components/motion-reveal";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "oyerindei13@gmail.com";
const substackUrl = "https://substack.com/@byiyanu";

export const metadata: Metadata = {
  title: "About",
  description: "A little about Iyanu Oyerinde and the ideas behind this space."
};

export default function AboutPage() {
  return (
    <section className="motion-page mx-auto min-h-[70vh] max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <MotionReveal className="mx-auto mt-0 flex max-w-3xl flex-col items-center gap-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent">A little context</p>
        <h1 className="text-balance font-medium leading-[0.92] tracking-editorial text-4xl md:text-6xl xl:text-8xl">
          Hello, I&apos;m <span className="font-serif italic font-normal pl-1.5">Iyanu</span><span className="text-accent">.</span>
        </h1>
        <div className="max-w-xl pt-2">
          
          <div className="article-copy text-left">
            <p>My interests move between design, architecture, technology, and the process of making things. I enjoy looking for connections between them — the shared questions, the patterns, and the possibilities that emerge when different perspectives meet.</p>
            <p>This website is a place to think in public. I&apos;ll use it to share writing, document ideas, and gradually collect work that feels worth keeping. It won&apos;t always be definitive, and that&apos;s part of the point.</p>
            <p>If something here resonates with you, or you want to talk about an idea or a project, I&apos;d be glad to hear from you.</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 w-[80%] max-w-[220px] justify-center text-sm text-white transition-colors hover:bg-accent">
              Get in touch <ArrowUpRight size={14} />
            </a>
            {/*<a href={substackUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-ink transition-colors hover:border-ink">
              Read on Substack <ArrowUpRight size={14} />
            </a>*/}
          </div>
        
        </div>
      </MotionReveal>
      <MotionReveal delay={100} className="mx-auto mt-20 flex max-w-3xl flex-col items-center border-t border-line pt-8 text-center sm:mt-28">
        <p className="text-xs text-neutral-500">A simple principle</p>
        <p className="mt-4 max-w-3xl text-balance font-serif text-3xl leading-snug tracking-tight sm:text-5xl">
          Stay curious. Make things with care. Share what you learn.
        </p>
      </MotionReveal>
    </section>
  );
}
