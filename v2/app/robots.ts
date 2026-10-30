import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: ["/", "/shelf/", "/about", "/work"], disallow: ["/admin", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
