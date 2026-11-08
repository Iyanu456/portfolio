"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

type PortfolioProject = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categories?: string[];
  year: string;
  summary: string;
  coverImage: string;
  tags: string[];
  featured: boolean;
  sortOrder: number;
  publishedAt?: Date | string | null;
};

const categories = [
  "All",
  "Branding",
  "Social media campaigns",
  "Organizations",
  "Editorial",
  "Digital design",
  "Packaging",
  "Others"
];

export default function DesignPortfolioBrowser({ projects }: { projects: PortfolioProject[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects
      .filter((project) => {
        const projectCategories = project.categories?.length ? project.categories : [project.category || "Others"];
        const matchesCategory = activeCategory === "All" || projectCategories.includes(activeCategory);
        const searchable = [
          project.title,
          project.category,
          ...projectCategories,
          project.summary,
          project.year,
          ...(project.tags || [])
        ].join(" ").toLowerCase();
        return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .sort((a, b) =>
        a.sortOrder - b.sortOrder ||
        Number(b.featured) - Number(a.featured) ||
        a.title.localeCompare(b.title)
      );
  }, [projects, query, activeCategory]);

  return (
    <section className="design-portfolio-browser pt-6 sm:pt-8" aria-label="Browse design projects">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const active = activeCategory === category;
            const count = category === "All"
              ? projects.length
              : projects.filter((project) => (project.categories?.length ? project.categories : [project.category || "Others"]).includes(category)).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                className={`design-filter-chip shrink-0 border-b-2 px-2.5 py-2 text-xs transition-colors ${active ? "is-active border-ink font-semibold text-ink" : "border-transparent text-neutral-500 hover:text-ink"}`}
              >
                {category}<span className="ml-1.5 text-[10px] text-neutral-400">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full shrink-0 sm:w-60">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search work"
            aria-label="Search work"
            className="h-9 w-full rounded-md border border-line bg-transparent pl-9 pr-8 text-xs outline-none transition placeholder:text-neutral-400 focus:border-neutral-500"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"><X size={13}/></button>}
        </label>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-xs text-neutral-500">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>
        {(query || activeCategory !== "All") && (
          <button type="button" onClick={() => { setQuery(""); setActiveCategory("All"); }} className="text-xs text-neutral-500 underline underline-offset-4 hover:text-ink">Clear filters</button>
        )}
      </div>

      {visibleProjects.length ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => {
            const projectCategories = project.categories?.length ? project.categories : [project.category || "Others"];
            return (
              <Link key={project.id} href={`/design/${project.slug}`} className={`design-project-card group block motion-stagger motion-stagger-${visibleProjects.indexOf(project) % 9}`}>
                <div className="design-project-card__media relative aspect-[1.618/1] overflow-hidden bg-[#efeee9]">
                  {project.coverImage && <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" unoptimized/>}
                  <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={15}/></span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="design-project-card__title text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">{project.title}</h2>
                    {/*<p className="mt-1 text-[10px] leading-5 text-neutral-500">{projectCategories.join(" · ")}</p>*/}
                  </div>
                  <span className="shrink-0 pt-0.5 text-xs text-neutral-400">{project.year}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border-b border-line py-20 text-center">
          <p className="text-sm font-medium">No work found.</p>
          <p className="mt-1 text-xs text-neutral-500">Try another category or search term.</p>
          <button type="button" onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-4 text-xs font-medium text-accent">Reset filters</button>
        </div>
      )}
    </section>
  );
}
