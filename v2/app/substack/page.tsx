import type { Metadata } from "next";
import { Heart, BookOpen, Coffee } from "lucide-react";
import SubstackSupportActions from "@/components/substack-support-actions";

export const metadata: Metadata = {
  title: "Support my writing",
  description:
    "If my writing on Substack has resonated with you, you can support my work with a one-time contribution.",
  alternates: { canonical: "/substack" },
  openGraph: {
    title: "Support my writing — Iyanu Oyerinde",
    description:
      "Help me keep writing, exploring ideas and sharing meaningful stories.",
    url: "/substack",
    type: "website",
  },
};

export default function SubstackSupportPage() {
  return (
    <>
      <section className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center sm:py-28">
        <span className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Heart size={22} />
        </span>
        {/*<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          A little support goes a long way
        </p>*/}
        <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-ink sm:text-6xl">
          A little appreciation goes a long way.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-neutral-600 sm:text-lg">
         {`I'm glad you're here and that you've found something worth reading in my little corner of the internet. If you'd like to show some appreciation, you're welcome to leave a little support. It's entirely optional, but always appreciated. Thank you for being here.`}
        </p>
        <div className="mt-9">
          <SubstackSupportActions />
        </div>
        {/*<p className="mt-4 text-xs text-neutral-400">
          A one-time contribution. No subscription or commitment.
        </p>*/}
        <div className="mt-16 grid w-full max-w-lg grid-cols-1 gap-3 border-t border-line pt-8 text-left sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl bg-paper p-4">
            <BookOpen size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-ink">More room to write</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Your support creates more time and space for thoughtful work.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl bg-paper p-4">
            <Coffee size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-ink">Completely voluntary</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Choose an amount that feels comfortable. Every bit is appreciated.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
