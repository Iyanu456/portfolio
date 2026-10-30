import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Layers3, PenLine, Shapes } from "lucide-react";
import MotionReveal from "@/components/motion-reveal";

export const metadata: Metadata = {
  title: "Work",
  description: "A growing collection of selected projects and experiments by Iyanu Oyerinde."
};

const areas = [
  { icon: Shapes, title: "Design", copy: "Visual identities, graphic design, and digital experiences." },
  { icon: Layers3, title: "Architecture", copy: "Spatial thinking, architectural work, and ways people experience place." },
  { icon: PenLine, title: "Technology & making", copy: "Software, product ideas, experiments, and things built to solve problems." }
];

export default function WorkPage() {
  return (
    <section className="motion-page mx-auto min-h-[70vh] max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <MotionReveal><div className="mx-auto flex max-w-3xl flex-col items-center text-center"><p className="text-[11px] uppercase tracking-[0.16em] text-accent">Selected work · In time</p>
      <h1 className="mt-5 text-balance font-medium leading-[0.92] tracking-editorial text-4xl md:text-6xl xl:text-8xl">Things I&apos;ve made<span className="text-accent">.</span></h1>
      <div className="mt-7 max-w-xl">
        <p className="text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
          This section will become a considered collection of projects, experiments, and work across disciplines. I&apos;m leaving it intentionally simple until there&apos;s a set of projects worth presenting together.
        </p>
        <Link href="/shelf" className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-accent">In the meantime, read what&apos;s on the shelf <ArrowUpRight size={14} /></Link>
      </div></div>
      </MotionReveal>
      <div className="mt-16 divide-y divide-line border-t border-line pt-5 sm:mt-12">
        {areas.map(({ icon: Icon, title, copy }, i) => (
          <MotionReveal key={title} delay={i * 60} className="py-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">0{i + 1}</span>
              <Icon size={18} strokeWidth={1.5} className="text-accent" />
            </div>
            <h2 className="mt-8 text-2xl font-medium tracking-editorial">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
