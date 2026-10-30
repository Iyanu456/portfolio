import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostCover } from "@/components/post-cover";
import type { Post } from "@/content/posts";

type ShelfPost = Post & { contentHtml?: string; coverImage?: string | null };


export function PostCard({ post, index = 0 }: { post: ShelfPost; index?: number }) {
  const isDraft = post.body.length === 0 && !post.contentHtml;
  const content = (
    <article className="group grid min-w-0 grid-cols-1 gap-4 border-t border-line py-5 transition-colors sm:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] sm:gap-6 sm:py-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="relative aspect-[16/9] w-full min-w-0 overflow-hidden rounded-lg bg-neutral-100 sm:aspect-[4/3] sm:max-h-[180px]">
        <PostCover
          src={post.coverImage || undefined}
          alt={`Cover image for ${post.title}`}
          fallbackLabel={post.category}
          className="transition-transform duration-500 group-hover:scale-[1.035]"
        />
      </div>
      <div className="min-w-0 max-w-full py-0.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-neutral-500 sm:mb-3 sm:text-[11px]">
          <span>{post.category}</span>
          <span>{isDraft ? "In progress" : post.readTime}</span>
        </div>
        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
          <h3 className="min-w-0 max-w-xl break-words [overflow-wrap:anywhere] text-[1.12rem] font-medium leading-[1.12] tracking-editorial transition-colors group-hover:text-accent sm:text-[1.7rem]">
            {post.title}
          </h3>
          <ArrowUpRight className="mt-1 shrink-0 text-neutral-400 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" size={17} />
        </div>
        <p className="mt-2 line-clamp-3 max-w-xl text-[13px] leading-5 text-neutral-600 sm:mt-3 sm:text-sm sm:leading-6">{post.excerpt}</p>
        <p className="mt-3 text-[11px] text-neutral-400 sm:mt-5 sm:text-xs">{post.date}</p>
      </div>
    </article>
  );

  if (isDraft) {
    return <div key={post.slug} className={`motion-stagger motion-stagger-${Math.min(index, 8)} opacity-75`} aria-label="Article coming soon">{content}</div>;
  }

  return <Link key={post.slug} href={`/shelf/${post.slug}`} aria-label={`Read ${post.title}`} className={`motion-stagger motion-stagger-${Math.min(index, 8)} block`}>{content}</Link>;
}
