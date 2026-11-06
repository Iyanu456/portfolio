import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ensurePostIndexes, serializePost, type PostRecord } from "@/lib/posts-db";
import { sendNewPostToSubscribers } from "@/lib/email";

export const runtime = "nodejs";
function normalizeActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item, index) => {
    const a = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const kind = ["subscribe", "like", "comments", "share", "support", "custom"].includes(String(a.kind)) ? String(a.kind) : "custom";
    return { id: String(a.id || `action-${index}`), kind: kind as "subscribe" | "like" | "comments" | "share" | "support" | "custom", label: String(a.label || "").slice(0, 100), description: String(a.description || "").slice(0, 240), url: String(a.url || "").slice(0, 2048), enabled: a.enabled !== false };
  }).filter((a) => a.label.trim().length > 0);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const posts = await ensurePostIndexes();
    const records = await posts.find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json(records.map((post) => serializePost(post as PostRecord & import("mongodb").Document)));
  } catch {
    return NextResponse.json({ error: "Could not connect to MongoDB. Check MONGODB_URI and MONGODB_DB." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim().toLowerCase();
  if (!title || !slug) return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  try {
    const posts = await ensurePostIndexes();
    const now = new Date();
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const record: PostRecord = {
      title, slug, excerpt: String(body.excerpt || ""), category: String(body.category || "Ideas & observations"),
      coverImage: body.coverImage ? String(body.coverImage) : null, contentHtml: String(body.contentHtml || ""), nextReadSlug: body.nextReadSlug ? String(body.nextReadSlug) : null, actionButtons: normalizeActions(body.actionButtons), emailSubscribersOnPublish: body.sendToSubscribers === true,
      status, publishedAt: status === "PUBLISHED" ? now : null, createdAt: now, updatedAt: now
    };
    const result = await posts.insertOne(record);
    let emailBroadcast: { total: number; sent: number; configured: boolean } | null = null;
    if (status === "PUBLISHED" && body.sendToSubscribers === true) {
      try { emailBroadcast = await sendNewPostToSubscribers({ title: record.title, excerpt: record.excerpt, slug: record.slug, category: record.category, contentHtml: record.contentHtml }); }
      catch (error) { console.error("[publish] Subscriber email broadcast failed:", error); emailBroadcast = { total: 0, sent: 0, configured: false }; }
    }
    return NextResponse.json({ ...record, id: result.insertedId.toString(), emailBroadcast }, { status: 201 });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === 11000;
    return NextResponse.json({ error: duplicate ? "That URL slug is already in use. Choose another." : "Could not save this post. Check your MongoDB connection." }, { status: duplicate ? 409 : 503 });
  }
}
