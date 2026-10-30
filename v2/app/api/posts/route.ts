import { NextResponse } from "next/server";
import { ensurePostIndexes } from "@/lib/posts-db";
export const runtime = "nodejs";
export async function GET() {
  try {
    const posts = await ensurePostIndexes();
    const records = await posts.find({ status: "PUBLISHED" }, { projection: { title: 1, slug: 1, excerpt: 1, category: 1, coverImage: 1, status: 1, publishedAt: 1, createdAt: 1 } }).sort({ publishedAt: -1, createdAt: -1 }).toArray();
    return NextResponse.json(records.map(({ _id, ...post }) => ({ ...post, id: _id?.toString() })));
  } catch { return NextResponse.json({ error: "Database is not configured." }, { status: 503 }); }
}
