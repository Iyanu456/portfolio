import type { Metadata } from "next";
import DesignPortfolioBrowser from "@/components/design-portfolio-browser";
import { getPublicDesignProjects } from "@/lib/public-design-projects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "A selection of graphic design, visual identity, campaign, art direction and digital design projects by Iyanu Oyerinde.",
  keywords: ["Iyanu Oyerinde portfolio", "graphic design portfolio", "brand identity", "visual identity", "art direction", "campaign design", "digital design", "graphic designer Nigeria"],
  alternates: { canonical: `${siteUrl.replace(/\/$/, "")}/design` },
  openGraph: {
    title: "Portfolio — Iyanu Oyerinde",
    description: "Selected creative work across visual identity, campaign design, art direction and digital experiences.",
    url: `${siteUrl.replace(/\/$/, "")}/design`,
    siteName: "Iyanu Oyerinde", locale: "en_US", type: "website",
    images: [{ url: `${siteUrl.replace(/\/$/, "")}/og-design.png`, width: 1200, height: 630, type: "image/png", alt: "Portfolio — Iyanu Oyerinde" }]
  },
  twitter: {
    card: "summary_large_image", title: "Portfolio — Iyanu Oyerinde",
    description: "Selected creative work across visual identity, campaign design and art direction.",
    images: [{ url: `${siteUrl.replace(/\/$/, "")}/og-design.png`, alt: "Portfolio — Iyanu Oyerinde" }]
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
};

export default async function DesignPage() {
  const projects = await getPublicDesignProjects();
  const pageUrl = `${siteUrl.replace(/\/$/, "")}/design`;
  const structuredData = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    "@id": `${pageUrl}#portfolio`, name: "Portfolio — Iyanu Oyerinde",
    description: "Selected creative work across visual identity, campaign design, art direction and digital experiences.",
    url: pageUrl, author: { "@type": "Person", name: "Iyanu Oyerinde", url: siteUrl },
    mainEntity: { "@type": "ItemList", itemListElement: projects.map((project: any, index: number) => ({
      "@type": "ListItem", position: index + 1, name: project.title, url: `${pageUrl}/${project.slug}`
    })) }
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        <header className="border-b border-line pb-6 pt-8 sm:pb-8 sm:pt-10">
          <h1 className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Work</h1>
        </header>

        <DesignPortfolioBrowser projects={projects}/>

      </section>
    </main>
  );
}
