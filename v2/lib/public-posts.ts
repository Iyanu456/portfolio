import sanitizeHtml from "sanitize-html";
import { getCollection } from "@/lib/mongodb";
import { getPublishedPosts as getStarterPosts, getPost as getStarterPost } from "@/content/posts";
import type { PostRecord } from "@/lib/posts-db";

const cleanArticleHtml = (html: string) => sanitizeHtml(html, {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "figure", "figcaption", "hr", "video", "source"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "class", "loading"],
    div: ["data-reader-action", "data-reader-kind", "data-reader-label", "data-reader-description", "data-reader-url", "class", "role", "tabindex", "aria-label"],
    figure: ["data-stop-motion", "data-frames", "data-fps", "data-loop", "data-alt", "class"],
    figcaption: ["class"],
    span: ["class"], strong: ["class"], p: ["class", "style"], h1: ["style"], h2: ["style"], h3: ["style"],
    a: ["href", "name", "target", "rel"],
    video: ["src", "controls", "preload", "poster", "width", "height"],
    source: ["src", "type"]
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) }
});

function toPublicPost(p: PostRecord) {
  const date = p.publishedAt ?? p.createdAt;
  const plain = sanitizeHtml(p.contentHtml || "", { allowedTags: [], allowedAttributes: {} });
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, nextReadSlug: p.nextReadSlug || null,
    date: date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }),
    publishedAt: date.toISOString(),
    updatedAt: (p.updatedAt ?? date).toISOString(),
    readTime: `${Math.max(1, Math.ceil(plain.split(/\s+/).filter(Boolean).length / 220))} min read`,
    featured: false, coverImage: p.coverImage, contentHtml: cleanArticleHtml(p.contentHtml || ""), actionButtons: (p.actionButtons || []).filter((a) => a.enabled && a.label && (["support", "like", "comments", "share"].includes(a.kind) || /^https?:\/\//i.test(a.url))), body: [] as never[]
  };
}

export async function getPublicPosts() {
  try {
    const collection = await getCollection<PostRecord>("posts");
    const records = await collection.find({ status: "PUBLISHED" }).sort({ publishedAt: -1, createdAt: -1 }).toArray();
    return records.map((p) => toPublicPost(p));
  } catch {
    // Starter content remains available while the database is being configured.
  }
  return getStarterPosts().map((p) => ({ ...p, publishedAt: new Date(p.date).toISOString(), updatedAt: new Date(p.date).toISOString(), coverImage: null, contentHtml: "", actionButtons: [] }));
}

export async function getPublicPost(slug: string) {
  try {
    const collection = await getCollection<PostRecord>("posts");
    const storedPost = await collection.findOne({ slug });
    if (storedPost) return storedPost.status === "PUBLISHED" ? toPublicPost(storedPost) : undefined;
  } catch {
    // Use starter posts until the database is configured.
  }
  const starter = getStarterPost(slug);
  return starter ? { ...starter, publishedAt: new Date(starter.date).toISOString(), updatedAt: new Date(starter.date).toISOString(), coverImage: null, contentHtml: "", actionButtons: [] } : undefined;
}
