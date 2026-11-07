import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { asDesignProjectId, getDesignProjectsCollection, serializeDesignProject, type DesignProject } from "@/lib/design-projects";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const clean = (value: unknown, max = 5000) => String(value ?? "").trim().slice(0, max);
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function normalize(body: Record<string, unknown>) {
  const title = clean(body.title, 140);
  const slug = slugify(clean(body.slug || title, 160));
  const gallery = Array.isArray(body.gallery) ? body.gallery.map((item) => clean(item, 2048)).filter(Boolean).slice(0, 20) : [];
  const tags = Array.isArray(body.tags) ? [...new Set(body.tags.map((item) => clean(item, 40)).filter(Boolean))].slice(0, 12) : [];
  const allowedCategories = ["Branding", "Social media campaigns", "Organizations", "Editorial", "Digital design", "Packaging", "Others"];
  const categories = Array.isArray(body.categories)
    ? [...new Set(body.categories.map((item) => clean(item, 60)).filter((item) => allowedCategories.includes(item)))].slice(0, allowedCategories.length)
    : [allowedCategories.includes(clean(body.category, 60)) ? clean(body.category, 60) : "Others"];
  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  return {
    title, slug, category: categories[0] || "Others", categories,
    year: clean(body.year, 12) || String(new Date().getFullYear()),
    summary: clean(body.summary, 300), description: clean(body.description, 12000),
    coverImage: clean(body.coverImage, 2048), gallery, tags,
    featured: body.featured === true, status,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.max(0, Math.min(9999, Number(body.sortOrder))) : 0
  };
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const _id = asDesignProjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const collection = await getDesignProjectsCollection();
    const project = await collection.findOne({ _id });
    return project ? NextResponse.json(serializeDesignProject(project)) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not load this project." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const _id = asDesignProjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const data = normalize(body && typeof body === "object" ? body : {});
  if (!data.title || !data.slug || !data.summary || !data.coverImage) {
    return NextResponse.json({ error: "Title, summary and cover image are required." }, { status: 400 });
  }
  try {
    const collection = await getDesignProjectsCollection();
    const previous = await collection.findOne({ _id });
    if (!previous) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const now = new Date();
    const update: Partial<DesignProject> = {
      ...data, updatedAt: now,
      publishedAt: data.status === "PUBLISHED" ? (previous.publishedAt || now) : null
    };
    await collection.updateOne({ _id }, { $set: update });
    return NextResponse.json({ ...previous, ...update, id });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === 11000;
    return NextResponse.json({ error: duplicate ? "That project URL is already in use. Change the slug." : "Could not update this project." }, { status: duplicate ? 409 : 503 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const _id = asDesignProjectId(id);
  if (!_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const collection = await getDesignProjectsCollection();
    const result = await collection.deleteOne({ _id });
    return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not delete this project." }, { status: 503 });
  }
}
