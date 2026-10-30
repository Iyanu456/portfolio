"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, ExternalLink, LogOut, Pencil, Trash2, Eye, Users, MousePointerClick, BookOpenText, MonitorSmartphone } from "lucide-react";

type Post = { id: string; title: string; slug: string; excerpt: string; category: string; status: string; updatedAt: string; publishedAt: string | null };
type Analytics = {
  periodDays: number; pageViews: number; uniqueVisitors: number; sessions: number; clicks: number; readingMilestones: number;
  posts: { slug: string; views: number; uniqueVisitors: number; clicks: number; completions: number }[];
  topClicks: { label: string; path: string; target: string; count: number }[];
};
const emptyAnalytics: Analytics = { periodDays: 30, pageViews: 0, uniqueVisitors: 0, sessions: 0, clicks: 0, readingMilestones: 0, posts: [], topClicks: [] };

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const router = useRouter();

  async function loadPosts() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/posts", { cache: "no-store" });
      if (response.status === 401) { router.replace("/admin/login"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load posts.");
      setPosts(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load posts. Check your database connection."); }
    finally { setLoading(false); }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (response.status === 401) { router.replace("/admin/login"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analytics are not available yet.");
      setAnalytics(data);
      setAnalyticsError("");
    } catch (cause) { setAnalyticsError(cause instanceof Error ? cause.message : "Analytics could not be loaded."); }
    finally { setAnalyticsLoading(false); }
  }

  useEffect(() => { void loadPosts(); void loadAnalytics(); }, []);
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  async function remove(post: Post) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (response.ok) void loadPosts(); else setError("Could not delete this post.");
  }

  const published = posts.filter((post) => post.status === "PUBLISHED").length;
  const drafts = posts.length - published;
  const postViews = new Map(analytics.posts.map((post) => [post.slug, post.views]));

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
      <div><p className="text-[11px] uppercase tracking-[0.16em] text-[#F05A28]">Iyanu Studio</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Your publication</h1><p className="mt-2 text-sm text-neutral-500">Manage writing and see how readers engage with it.</p></div>
      <div className="flex items-center gap-3"><Link href="/" target="_blank" className="hidden items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm sm:inline-flex">View site <ExternalLink size={14}/></Link><button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm hover:bg-white"><LogOut size={14}/> Sign out</button></div>
    </header>

    <section className="mt-8" aria-labelledby="analytics-heading">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="analytics-heading" className="text-lg font-semibold tracking-tight">Publication insights</h2><p className="mt-1 text-xs text-neutral-500">Last 30 days · updates as readers browse</p></div><button onClick={() => void loadAnalytics()} className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-white">Refresh insights</button></div>
      {analyticsError && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{analyticsError}. New metrics appear here after the analytics collection is available.</p>}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[{ label: "Page views", value: analytics.pageViews, icon: Eye }, { label: "Unique browsers", value: analytics.uniqueVisitors, icon: Users }, { label: "Sessions", value: analytics.sessions, icon: MonitorSmartphone }, { label: "Tracked clicks", value: analytics.clicks, icon: MousePointerClick }, { label: "Read milestones", value: analytics.readingMilestones, icon: BookOpenText }].map((metric) => <div key={metric.label} className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-xs text-neutral-500">{metric.label}</span><metric.icon size={16} className="text-neutral-400"/></div><p className="mt-3 text-2xl font-semibold tracking-tight">{analyticsLoading ? "—" : metric.value.toLocaleString()}</p></div>)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white"><div className="border-b border-neutral-100 px-4 py-3"><h3 className="text-sm font-semibold">Article performance</h3></div>{analytics.posts.length ? <div className="divide-y divide-neutral-100">{analytics.posts.slice(0, 8).map((item) => { const post = posts.find((entry) => entry.slug === item.slug); return <div key={item.slug} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{post?.title || item.slug}</p><p className="mt-0.5 text-[11px] text-neutral-500">{item.uniqueVisitors.toLocaleString()} unique readers · {item.clicks.toLocaleString()} clicks · {item.completions.toLocaleString()} finished reads</p></div><span className="shrink-0 text-sm font-semibold tabular-nums">{item.views.toLocaleString()} <span className="text-xs font-normal text-neutral-400">views</span></span></div>; })}</div> : <p className="px-4 py-8 text-sm text-neutral-500">{analyticsLoading ? "Loading article metrics…" : "Article views will appear here as readers visit your posts."}</p>}</div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white"><div className="border-b border-neutral-100 px-4 py-3"><h3 className="text-sm font-semibold">Most-clicked actions</h3></div>{analytics.topClicks.length ? <div className="divide-y divide-neutral-100">{analytics.topClicks.slice(0, 7).map((item, index) => <div key={`${item.path}-${item.label}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.label}</p><p className="mt-0.5 truncate text-[11px] text-neutral-500">{item.path}</p></div><span className="text-sm font-semibold tabular-nums">{item.count}</span></div>)}</div> : <p className="px-4 py-8 text-sm text-neutral-500">Tracked link and button clicks will appear here.</p>}</div>
      </div>
    </section>

    <section className="mt-10" aria-labelledby="posts-heading">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 id="posts-heading" className="text-lg font-semibold tracking-tight">Your posts</h2><p className="mt-1 text-xs text-neutral-500">{posts.length} total · {published} published · {drafts} drafts</p></div><Link href="/admin/posts/new" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-[#F05A28]"><Plus size={16}/> Write a post</Link></div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white"><div className="divide-y divide-neutral-100">{loading ? <p className="p-6 text-sm text-neutral-500">Loading posts…</p> : posts.length === 0 ? <div className="px-6 py-14 text-center"><FileText className="mx-auto text-neutral-400" size={26}/><h3 className="mt-4 font-medium">Your first post starts here.</h3><p className="mt-2 text-sm text-neutral-500">Create a draft, shape your ideas, and publish when it is ready.</p><Link href="/admin/posts/new" className="mt-5 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm text-white">Write your first post</Link></div> : posts.map((post) => <div key={post.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-medium">{post.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${post.status === "PUBLISHED" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>{post.status === "PUBLISHED" ? "Published" : "Draft"}</span></div><p className="mt-1 text-xs text-neutral-500">{post.category} · Updated {new Date(post.updatedAt).toLocaleDateString()} {post.status === "PUBLISHED" && <span>· {postViews.get(post.slug) || 0} views / 30 days</span>}</p></div><div className="flex items-center gap-2"><Link href={`/admin/posts/${post.id}`} aria-label={`Edit ${post.title}`} className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"><Pencil size={15}/></Link>{post.status === "PUBLISHED" && <Link href={`/shelf/${post.slug}`} target="_blank" aria-label={`View ${post.title}`} className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"><ExternalLink size={15}/></Link>}<button onClick={() => void remove(post)} aria-label={`Delete ${post.title}`} className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={15}/></button></div></div>)}</div></section>
    </section>
    <p className="mt-5 text-xs leading-5 text-neutral-500">Analytics use first-party random browser and tab-session identifiers; they record page views, button/link clicks, and reading milestones, not names or email addresses. Local development traffic is excluded. Counts are approximate: privacy tools, cleared storage, and multiple devices can affect unique-browser totals. To exclude this browser from tracking, set localStorage key iyanu-analytics-opt-out to true in the browser console.</p>
  </div>;
}
