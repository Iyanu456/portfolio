import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MoveRight } from "lucide-react";
import { getPublicPosts } from "@/lib/public-posts";
import { PostCard } from "@/components/post-card";
import MotionReveal from "@/components/motion-reveal";

export default async function HomePage() {
  const posts = await getPublicPosts();
  const featured = posts[0];

  return (
    <div className="motion-page">
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-14 sm:px-8 sm:pb-24 sm:pt-24">
        <MotionReveal className="flex flex-col items-center gap-8 text-center">
          <div className="flex w-full flex-col items-center">
            <h1 className="max-w-4xl text-balance text-[clamp(3.25rem,9.2vw,7.8rem)] font-medium leading-[0.92] tracking-editorial">
              A place for
              <br />
              ideas to <span className="font-serif italic font-normal">take</span>
              <br />
              shape<span className="text-accent">.</span>
            </h1>
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="mx-auto max-w-xl text-balance text-base leading-7 text-neutral-700 sm:text-lg sm:leading-8">
              {`Hey, glad you're here. This is a place to explore interesting ideas, discover fresh perspectives, and see familiar things differently.`}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Link href="/shelf" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-white transition-colors hover:bg-accent">
                Explore the shelf <ArrowUpRight size={15} />
              </Link>
              <Link href="/about" className="text-sm text-neutral-600 underline decoration-line underline-offset-4 hover:text-ink">
                A little about me
              </Link>
            </div>
          </div>
        </MotionReveal>
        <MotionReveal delay={100} className="mt-14 flex flex-col items-center justify-center gap-2 border-y border-line py-4 text-center sm:mt-24 sm:flex-row sm:gap-6">
          <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Writing across interests</span>
          <span className="flex items-center gap-2 text-xs text-neutral-500">Curiosity is the common thread <ArrowDownRight size={14} /></span>
        </MotionReveal>
      </section>

      

      <section className="border-y border-line bg-white/45">
        <MotionReveal className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-accent">01 / The shelf</p>
              <h2 className="mt-3 text-3xl font-medium tracking-editorial sm:text-4xl">Recent posts</h2>
            </div>
            <Link href="/shelf" className="hidden items-center gap-2 text-sm text-neutral-600 hover:text-accent sm:inline-flex">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="space-y-0">
            {posts.slice(0, 3).map((post, index) => <PostCard key={post.slug} post={post} index={index} />)}
          </div>
        </MotionReveal>
      </section>

     
    </div>
  );
}
