import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ensurePostIndexes } from "@/lib/posts-db";
import type { Collection, Document } from "mongodb";
import { notifyOwner, emailShell, escapeHtml } from "@/lib/email";

export const runtime = "nodejs";
type Context = { params: Promise<{ slug: string }> };
type LikeRecord = Document & { slug: string; name: string; email?: string; normalizedEmail?: string; normalizedName?: string; createdAt: Date };
type CommentRecord = Document & { slug: string; name: string; email: string; body: string; createdAt: Date };

function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
async function getPublishedPost(slug: string) {
  const posts = await ensurePostIndexes();
  return posts.findOne({ slug, status: "PUBLISHED" });
}

let likeIndexesReady: Promise<void> | undefined;
let commentIndexesReady: Promise<void> | undefined;

async function ensureLikeIndexes(likes: Collection<LikeRecord>) {
  if (!likeIndexesReady) {
    likeIndexesReady = (async () => {
      // Remove the legacy name-based unique index once, then enforce one like per email/post.
      await likes.dropIndex("slug_1_normalizedName_1").catch(() => undefined);
      await likes.createIndex({ slug: 1, normalizedEmail: 1 }, { unique: true, sparse: true });
    })().catch((error) => { likeIndexesReady = undefined; throw error; });
  }
  return likeIndexesReady;
}

async function ensureCommentIndexes(comments: Collection<CommentRecord>) {
  if (!commentIndexesReady) {
    commentIndexesReady = comments.createIndex({ slug: 1, createdAt: -1 }).then(() => undefined).catch((error) => { commentIndexesReady = undefined; throw error; });
  }
  return commentIndexesReady;
}

export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  try {
    if (!(await getPublishedPost(slug))) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    const likes = await getCollection<LikeRecord>("post_likes");
    const comments = await getCollection<CommentRecord>("post_comments");
    await Promise.all([ensureLikeIndexes(likes), ensureCommentIndexes(comments)]);
    const [likeCount, likesList, records] = await Promise.all([
      likes.countDocuments({ slug }),
      likes.find({ slug }, { projection: { email: 1, _id: 0 } }).sort({ createdAt: -1 }).limit(8).toArray(),
      comments.find({ slug }, { projection: { name: 1, body: 1, createdAt: 1, _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray()
    ]);
    const avatarPalette = ["#DCEAFE", "#FCE7D6", "#E9DDFB", "#D9F2E6", "#F8DFE7", "#E7E9F0", "#F5EDC8", "#D8EEF1"];
    const likeAvatars = likesList.map((item) => {
      const email = String(item.email || "");
      const local = email.split("@")[0].replace(/[^a-z0-9]/gi, "");
      let hash = 0; for (const char of email.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      return { initials: (local.slice(0, 2) || "R").toUpperCase(), color: avatarPalette[hash % avatarPalette.length] };
    });
    return NextResponse.json({
      likeCount,
      likeAvatars,
      comments: records.map((item) => ({
        name: String(item.name || ""),
        body: String(item.body || ""),
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date().toISOString()
      }))
    });
  } catch {
    return NextResponse.json({ error: "Interactions are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: Context) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  try {
    if (!(await getPublishedPost(slug))) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    if (action === "like") {
      const name = cleanText(body.name, 80);
      const email = String(body.email || "").trim().toLowerCase();
      if (name.length < 2) return NextResponse.json({ error: "Please enter your name (at least 2 characters)." }, { status: 400 });
      if (!validEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      const likes = await getCollection<LikeRecord>("post_likes");
      await ensureLikeIndexes(likes);
      const normalizedEmail = email.toLowerCase();
      try {
        await likes.insertOne({ slug, name, email, normalizedEmail, createdAt: new Date() });
        await notifyOwner(`New like on “${slug}”`, emailShell(`<h1 style="font-size:24px">Someone liked an article</h1><p style="line-height:1.7;color:#555"><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) liked <a href="${(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")}/shelf/${encodeURIComponent(slug)}">${escapeHtml(slug)}</a>.</p>`), `${name} (${email}) liked ${slug}.`);
        return NextResponse.json({ ok: true, liked: true, message: "Thanks for the like!" }, { status: 201 });
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
          return NextResponse.json({ ok: true, liked: false, message: "This email has already liked this post." });
        }
        throw error;
      }
    }

    if (action === "comment") {
      const name = cleanText(body.name, 80);
      const email = String(body.email || "").trim().toLowerCase();
      const comment = String(body.comment || "").trim().slice(0, 3000);
      if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
      if (!validEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      if (comment.length < 2) return NextResponse.json({ error: "Please write a comment before submitting." }, { status: 400 });
      const comments = await getCollection<CommentRecord>("post_comments");
      await ensureCommentIndexes(comments);
      const result = await comments.insertOne({ slug, name, email, body: comment, createdAt: new Date() });
      await notifyOwner(`New comment on “${slug}”`, emailShell(`<h1 style="font-size:24px">A reader left a comment</h1><p style="line-height:1.7;color:#555"><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) commented on <a href="${(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")}/shelf/${encodeURIComponent(slug)}">${escapeHtml(slug)}</a>:</p><blockquote style="margin:18px 0;padding:12px 16px;border-left:3px solid #f05a28;background:#faf9f6;line-height:1.7">${escapeHtml(comment)}</blockquote>`), `${name} (${email}) commented on ${slug}: ${comment}`);
      return NextResponse.json({ ok: true, comment: { name, body: comment, createdAt: new Date().toISOString() }, id: result.insertedId.toString() }, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not save your response right now. Please try again." }, { status: 503 });
  }
}
