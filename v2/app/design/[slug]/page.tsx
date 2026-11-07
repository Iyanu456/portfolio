import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import DesignProjectGallery from "@/components/design-project-gallery";
import { DesignContactTrigger } from "@/components/design-contact-modal";
import MotionReveal from "@/components/motion-reveal";
import { getPublicDesignProject } from "@/lib/public-design-projects";

type Context = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicDesignProject(slug);
  if (!project) return { title: "Project not found" };
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/design/${project.slug}`;
  const description = project.summary || `Explore ${project.title}, a creative project by Iyanu Oyerinde.`;
  const image = project.coverImage || undefined;
  const imageAlt = `${project.title} — selected work by Iyanu Oyerinde`;
  return {
    title: project.title, description,
    keywords: ["Iyanu Oyerinde", "design portfolio", ...(project.categories || [project.category]), ...(project.tags || []), project.title],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${project.title} — Iyanu Oyerinde`, description, url: canonicalUrl,
      siteName: "Iyanu Oyerinde", locale: "en_US", type: "website",
      images: image ? [{ url: image, alt: imageAlt }] : undefined
    },
    twitter: {
      card: "summary_large_image", title: `${project.title} — Iyanu Oyerinde`, description,
      images: image ? [{ url: image, alt: imageAlt }] : undefined
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
  };
}

export default async function DesignProjectPage({ params }: Context) {
  const { slug } = await params;
  const project = await getPublicDesignProject(slug);
  if (!project) notFound();

  const galleryImages = [...new Set((project.gallery || []).filter((image) => image && image !== project.coverImage))];
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/design/${project.slug}`;
  const projectStructuredData = {
    "@context": "https://schema.org", "@type": "CreativeWork",
    "@id": `${canonicalUrl}#creativework`, name: project.title,
    description: project.summary, url: canonicalUrl, image: project.coverImage || undefined,
    creator: { "@type": "Person", name: "Iyanu Oyerinde", url: siteUrl },
    dateCreated: project.year,
    keywords: [...(project.categories || [project.category]), ...(project.tags || [])].join(", "),
    inLanguage: "en"
  };

  return (
    <main className="motion-page design-project-page min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectStructuredData).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Link href="/design" className="inline-flex items-center gap-2 text-xs text-neutral-500 transition hover:text-ink"><ArrowLeft size={14}/> All projects</Link>
        <MotionReveal>
          <header className="mx-auto max-w-3xl py-12 text-center sm:py-20">
            {/*<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{(project.categories?.length ? project.categories : [project.category]).join(" · ")} · {project.year}</p>*/}
            <h1 className="mt-5 text-balance text-4xl font-medium leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{project.title}</h1>
            {/*<p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">///{project.summary}</p>*/}
          </header>
        </MotionReveal>
        {project.coverImage && (
          <MotionReveal delay={70}>
            <div className="design-project-cover relative aspect-[16/10] overflow-hidden bg-[#efeee9] sm:aspect-[16/9]">
              <Image src={project.coverImage} alt={project.title} fill priority sizes="100vw" className="object-cover" unoptimized/>
            </div>
          </MotionReveal>
        )}
        <MotionReveal delay={90}><div className="mx-auto grid max-w-5xl gap-10 py-12 sm:grid-cols-[0.7fr_1.3fr] sm:py-16">
          <aside>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Project details</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-xs text-neutral-400">Categories</dt><dd className="mt-1 leading-6">{(project.categories?.length ? project.categories : [project.category]).join(" · ")}</dd></div>
              <div><dt className="text-xs text-neutral-400">Year</dt><dd className="mt-1">{project.year}</dd></div>
              {project.tags?.length > 0 && <div><dt className="text-xs text-neutral-400">Focus</dt><dd className="mt-1 leading-6">{project.tags.join(" · ")}</dd></div>}
            </dl>
          </aside>
          <div className="max-w-2xl whitespace-pre-wrap text-[15px] leading-8 text-neutral-600">{project.description}</div>
        </div></MotionReveal>
        <MotionReveal delay={110}><div className="pt-3 sm:pt-5">
          <DesignProjectGallery images={galleryImages.map((src: string, index: number) => ({ src, alt: `${project.title} — image ${index + 2}` }))}/>
        </div></MotionReveal>
        <MotionReveal delay={130}><div className="design-contact-cta mt-16 flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-[#f3f0e9] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><p className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Interested in working together?</p><p className="mt-2 text-base leading-7 text-neutral-600">Have a project in mind? Let’s make something meaningful.</p></div>
          <DesignContactTrigger className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-accent">Get in touch <ArrowUpRight size={16}/></DesignContactTrigger>
        </div></MotionReveal>
      </article>
    </main>
  );
}
