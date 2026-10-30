import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { getPublicPost, getPublicPosts } from "@/lib/public-posts";
import PostInteractions from "@/components/post-interactions";
import ArticleInlineActionBridge from "@/components/article-inline-action-bridge";
import ArticleEndCtas from "@/components/article-end-ctas";
import SupportPaymentModal from "@/components/support-payment-modal";
import ReadingProgress from "@/components/reading-progress";
import MotionReveal from "@/components/motion-reveal";

export const dynamic = "force-dynamic";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

// Social crawlers are more reliable with a predictable JPEG than a negotiated
// AVIF/WebP response. Cloudinary may URL-encode transformation commas/colons,
// so remove the existing transformation segment by position rather than matching
// one literal URL spelling.
function getSocialImageUrl(imageUrl: string) {
  if (!imageUrl.includes("res.cloudinary.com/")) return imageUrl;

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/");
    const uploadIndex = segments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1) return imageUrl;

    const nextSegment = segments[uploadIndex + 1] || "";
    const decodedNextSegment = decodeURIComponent(nextSegment);
    const looksLikeTransformation =
      /^(?:f_|q_|w_|h_|c_|g_|ar_|dpr_|e_|fl_|b_|t_|x_|y_|z_|ac_|af_|br_|cs_|dl_|dn_|du_|eo_|ki_|l_|o_|pg_|r_|so_|sp_|vc_|vs_|fps_|q_auto|f_auto)/.test(decodedNextSegment);

    if (looksLikeTransformation) {
      segments.splice(uploadIndex + 1, 1);
    }

    segments.splice(uploadIndex + 1, 0, "f_jpg,q_90,w_1200,h_630,c_fill,g_auto");
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return imageUrl;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post)
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  const url = `${siteUrl.replace(/\/$/, "")}/shelf/${post.slug}`;
  const image =
    post.coverImage || `${siteUrl.replace(/\/$/, "")}/og-default.png`;
  const socialImage = getSocialImageUrl(image);
  const description = post.excerpt || `Read “${post.title}” by Iyanu Oyerinde.`;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: "Iyanu Oyerinde",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${post.title} — Iyanu Oyerinde` }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: ["Iyanu Oyerinde"],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [{ url: socialImage, alt: `${post.title} — Iyanu Oyerinde` }],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const allPosts = await getPublicPosts();
  const nextRead = allPosts.find((item) => item.slug !== post.slug) || null;
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/shelf/${post.slug}`;
  const plainText = post.excerpt || post.title;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    url: canonicalUrl,
    headline: post.title,
    description: plainText,
    author: { "@type": "Person", name: "Iyanu Oyerinde" },
    publisher: { "@type": "Person", name: "Iyanu Oyerinde" },
    mainEntityOfPage: canonicalUrl,
    image: [getSocialImageUrl(post.coverImage || `${siteUrl.replace(/\/$/, "")}/og-default.png`)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    articleSection: post.category,
    inLanguage: "en",
  };

  return (
    <article className="motion-page mx-auto min-h-[70vh] max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-14">
      <ReadingProgress slug={post.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/shelf"
        className="hidden items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-accent sm:inline-flex"
      >
        <ArrowLeft size={14} /> Back to the shelf
      </Link>
      <MotionReveal className="mx-auto mt-0 max-w-3xl sm:mt-20">
        <header className="border-b border-line pb-9">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
            {post.category}
          </p>
          <h1 className="article-title-wrap mt-5 text-3xl font-medium leading-[1.04] tracking-editorial sm:text-5xl lg:text-7xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            {post.excerpt}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span>By Iyanu Oyerinde</span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span>{post.date}</span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {post.readTime}
            </span>
          </div>
        </header>
      </MotionReveal>
      {post.coverImage && (
        <MotionReveal delay={80} className="mx-auto mt-8 max-w-4xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-h-[560px] w-full rounded-sm object-cover"
          />
        </MotionReveal>
      )}
      <ArticleInlineActionBridge>
        {post.contentHtml ? (
          <div
            className="article-copy mx-auto mt-10 max-w-[680px]"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        ) : (
          <div className="article-copy mx-auto mt-10 max-w-[680px]">
            {post.body.map((block, index) =>
              block.type === "h2" ? (
                <h2 key={index}>{block.text}</h2>
              ) : block.type === "quote" ? (
                <blockquote key={index}>{block.text}</blockquote>
              ) : (
                <p key={index}>{block.text}</p>
              ),
            )}
          </div>
        )}
      </ArticleInlineActionBridge>
      <ArticleEndCtas />
      <PostInteractions
        slug={post.slug}
        title={post.title}
        excerpt={post.excerpt}
      />
      <SupportPaymentModal />
      {nextRead && (
        <MotionReveal className="mx-auto mt-12 max-w-[760px]">
          <aside
            className="border-t border-line pt-8"
            aria-label="Recommended next read"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
              Recommended next read
            </p>
            <Link
              href={`/shelf/${nextRead.slug}`}
              className="group mt-4 block rounded-xl border border-line p-5 transition-colors hover:border-neutral-400 sm:p-6"
            >
              <span className="text-xs text-neutral-500">
                {nextRead.category}
              </span>
              <span className="mt-2 block text-2xl font-medium leading-tight tracking-tight group-hover:text-accent sm:text-3xl">
                {nextRead.title}
              </span>
              <span className="mt-3 block max-w-xl text-sm leading-6 text-neutral-600">
                {nextRead.excerpt}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                Read next <ArrowUpRight size={15} />
              </span>
            </Link>
          </aside>
        </MotionReveal>
      )}
    </article>
  );
}
