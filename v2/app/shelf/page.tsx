import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/public-posts";
import ShelfBrowser from "@/components/shelf-browser";
import MotionReveal from "@/components/motion-reveal";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shelf",
  description: "Articles, essays, notes, and observations by Iyanu Oyerinde.",
};
export default async function ShelfPage() {
  const posts = await getPublicPosts();
  return (
    <section className="motion-page mx-auto min-h-[70vh] w-full max-w-6xl overflow-x-clip px-5 pb-24 pt-14 sm:px-8 sm:pb-32 sm:pt-24">
      <MotionReveal>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
            The shelf
          </p>
          <h1 className="mt-5 text-balance font-medium leading-[0.92] tracking-editorial text-4xl md:text-6xl xl:text-8xl"> Thoughts in progress<span className="text-accent">.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-neutral-600">
            A growing collection of essays, observations, and questions about
            whatever seems worth exploring. Some ideas arrive polished; others
            begin as a note.
          </p>
        
        </div>
      </MotionReveal>
      <ShelfBrowser posts={posts} />
      <p className="mt-10 border-t border-line pt-5 text-xs text-neutral-400">
        New writing will appear here as it is published.
      </p>
    </section>
  );
}
