import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { asObjectId, ensurePostIndexes, serializePost, type PostRecord } from "@/lib/posts-db";
import type { Document } from "mongodb";
import { sendNewPostToSubscribers } from "@/lib/email";
type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
function normalizeActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item, index) => {
    const a = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const kind = ["subscribe", "like", "comments", "share", "support", "custom"].includes(String(a.kind)) ? String(a.kind) : "custom";
    return { id: String(a.id || `action-${index}`), kind: kind as "subscribe" | "like" | "comments" | "share" | "support" | "custom", label: String(a.label || "").slice(0, 100), description: String(a.description || "").slice(0, 240), url: String(a.url || "").slice(0, 2048), enabled: a.enabled !== false };
  }).filter((a) => a.label.trim().length > 0);
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const _id = asObjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const posts = await ensurePostIndexes(); const post = await posts.findOne({ _id });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serializePost(post as PostRecord & Document));
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB." }, { status: 503 }); }
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const _id = asObjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim(); const slug = String(body.slug || "").trim().toLowerCase();
  if (!title || !slug) return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  try {
    const posts = await ensurePostIndexes(); const previous = await posts.findOne({ _id });
    if (!previous) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const status: "PUBLISHED" | "DRAFT" = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"; const now = new Date();
    const publishedAt = status === "PUBLISHED" ? (previous.publishedAt ?? now) : null;
    const update: Partial<import("@/lib/posts-db").PostRecord> = { title, slug, excerpt: String(body.excerpt || ""), category: String(body.category || "Ideas & observations"), coverImage: body.coverImage ? String(body.coverImage) : null, contentHtml: String(body.contentHtml || ""), nextReadSlug: body.nextReadSlug ? String(body.nextReadSlug) : null, actionButtons: normalizeActions(body.actionButtons), emailSubscribersOnPublish: body.sendToSubscribers === true, status, publishedAt, updatedAt: now };
    await posts.updateOne({ _id }, { $set: update });
    let emailBroadcast: { total: number; sent: number; configured: boolean } | null = null;
    if (previous.status !== "PUBLISHED" && status === "PUBLISHED" && body.sendToSubscribers === true) {
      try { emailBroadcast = await sendNewPostToSubscribers({ title, excerpt: String(body.excerpt || ""), slug, category: String(body.category || "Ideas & observations"), contentHtml: String(body.contentHtml || "") }); }
      catch (error) { console.error("[publish] Subscriber email broadcast failed:", error); emailBroadcast = { total: 0, sent: 0, configured: false }; }
    }
    return NextResponse.json({ ...previous, ...update, id: id, emailBroadcast });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === 11000;
    return NextResponse.json({ error: duplicate ? "That URL slug is already in use. Choose another." : "Could not update this post." }, { status: duplicate ? 409 : 503 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const _id = asObjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const action = body.action;
  if (action !== "archive" && action !== "restore") return NextResponse.json({ error: "Invalid archive action." }, { status: 400 });
  try {
    const posts = await ensurePostIndexes();
    const current = await posts.findOne({ _id });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (action === "archive") {
      await posts.updateOne({ _id }, { $set: { status: "ARCHIVED", archivedFromStatus: current.status === "DRAFT" ? "DRAFT" : "PUBLISHED", updatedAt: new Date() } });
    } else {
      const restoreStatus = current.archivedFromStatus || "PUBLISHED";
      await posts.updateOne({ _id }, { $set: { status: restoreStatus, updatedAt: new Date() }, $unset: { archivedFromStatus: "" } });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not update archive status." }, { status: 503 }); }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const _id = asObjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const posts = await ensurePostIndexes(); const result = await posts.deleteOne({ _id });
    if (!result.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not delete post." }, { status: 503 }); }
}
