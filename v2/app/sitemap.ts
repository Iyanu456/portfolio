import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/lib/public-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000").replace(/\/$/, "");
  const posts = await getPublicPosts();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shelf`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/work`, changeFrequency: "monthly", priority: 0.6 }
  ];
  return [...staticRoutes, ...posts.map((post) => ({ url: `${siteUrl}/shelf/${post.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }))];
}
