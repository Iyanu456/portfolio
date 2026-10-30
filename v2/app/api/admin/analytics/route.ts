import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const events = await getCollection("analytics_events");
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const match = { createdAt: { $gte: since } };
    const [totals, visitors, sessions, posts, postClicks, postCompletions, clicks, milestones] = await Promise.all([
      events.aggregate([{ $match: match }, { $group: { _id: "$type", count: { $sum: 1 } } }]).toArray(),
      events.distinct("visitorId", { ...match, type: "page_view" }),
      events.distinct("sessionId", { ...match, type: "page_view", sessionId: { $type: "string" } }),
      events.aggregate([
        { $match: { ...match, type: "page_view", path: { $regex: "^/shelf/[^/]+$" } } },
        { $group: { _id: "$slug", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
        { $project: { slug: "$_id", views: 1, uniqueVisitors: { $size: "$visitors" } } },
        { $sort: { views: -1 } }, { $limit: 50 },
      ]).toArray(),
      events.aggregate([
        { $match: { ...match, type: "click", path: { $regex: "^/shelf/[^/]+$" } } },
        { $group: { _id: "$slug", clicks: { $sum: 1 } } },
      ]).toArray(),
      events.aggregate([
        { $match: { ...match, type: "read_milestone", milestone: 100 } },
        { $group: { _id: "$slug", completions: { $sum: 1 } } },
      ]).toArray(),
      events.aggregate([
        { $match: { ...match, type: "click" } },
        { $group: { _id: { label: "$label", path: "$path", target: "$target" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 12 },
      ]).toArray(),
      events.aggregate([
        { $match: { ...match, type: "read_milestone" } },
        { $group: { _id: { slug: "$slug", milestone: "$milestone" }, count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    const count = (type: string) => Number(totals.find((item) => item._id === type)?.count || 0);
    return NextResponse.json({
      periodDays: 30,
      pageViews: count("page_view"),
      uniqueVisitors: visitors.length,
      sessions: sessions.length,
      clicks: count("click"),
      readingMilestones: count("read_milestone"),
      posts: posts.map((item) => ({ slug: item.slug, views: item.views, uniqueVisitors: item.uniqueVisitors, clicks: Number(postClicks.find((click) => click._id === item.slug)?.clicks || 0), completions: Number(postCompletions.find((completion) => completion._id === item.slug)?.completions || 0) })),
      topClicks: clicks.map((item) => ({ label: item._id.label || "Interaction", path: item._id.path, target: item._id.target || "", count: item.count })),
      readDepth: milestones.map((item) => ({ slug: item._id.slug || "", milestone: item._id.milestone, count: item.count })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load analytics. Check your MongoDB connection." }, { status: 503 });
  }
}
