"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/content/posts";

type ShelfPost = Post & { contentHtml?: string; coverImage?: string | null };

export default function ShelfBrowser({ posts }: { posts: ShelfPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(posts.map((post) => post.category).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [posts],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesQuery =
        !term ||
        [post.title, post.excerpt, post.category].some((value) =>
          value.toLocaleLowerCase().includes(term),
        );
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category]);

  return (
    <div className="mt-12">
      <div className="mx-auto max-w-3xl">
        <label htmlFor="shelf-search" className="sr-only">
          Search essays
        </label>
        <div className="flex h-12 items-center gap-3 rounded-full border border-gray-300 bg-white px-4 transition focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-900/5">
          <Search size={17} className="shrink-0 text-neutral-400" />
          <input
            style={{ outline: "none" }}
            id="shelf-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search essays, ideas, topics..."
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
          aria-label="Filter essays by category"
        >
          <span className="mr-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
            <SlidersHorizontal size={12} /> Filter
          </span>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-full border px-3.5 py-2 text-xs transition ${category === item ? "border-neutral-900 bg-neutral-900 text-white" : "border-line bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 space-y-0">
        {filtered.length ? (
          filtered.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))
        ) : (
          <div className="border-y border-line py-14 text-center">
            <p className="text-lg font-medium tracking-tight">
              No essays found.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Try another search or choose a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="mt-5 text-xs font-semibold text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <p
        className="mt-4 text-center text-[11px] text-neutral-400"
        aria-live="polite"
      >
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}{" "}
        {query || category !== "All" ? "found" : "on the shelf"}
      </p>
    </div>
  );
}
