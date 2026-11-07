import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ensureStarterDesignProjects, getDesignProjectsCollection, serializeDesignProject, type DesignProject, type DesignProjectData } from "@/lib/design-projects";

export const runtime = "nodejs";

const clean = (value: unknown, max = 5000) => String(value ?? "").trim().slice(0, max);
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function normalize(body: Record<string, unknown>): DesignProjectData {
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
    title, slug,
    category: categories[0] || "Others",
    categories,
    year: clean(body.year, 12) || String(new Date().getFullYear()),
    summary: clean(body.summary, 300),
    description: clean(body.description, 12000),
    coverImage: clean(body.coverImage, 2048),
    gallery, tags,
    featured: body.featured === true,
    status,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.max(0, Math.min(9999, Number(body.sortOrder))) : 0
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const collection = await ensureStarterDesignProjects();
    const projects = await collection.find({}).sort({ sortOrder: 1, updatedAt: -1 }).toArray();
    return NextResponse.json(projects.map(serializeDesignProject));
  } catch {
    return NextResponse.json({ error: "Could not load design projects. Check MongoDB configuration." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const data = normalize(body && typeof body === "object" ? body : {});
  if (!data.title || !data.slug) return NextResponse.json({ error: "Project title is required." }, { status: 400 });
  if (!data.summary) return NextResponse.json({ error: "Add a short project summary." }, { status: 400 });
  if (!data.coverImage) return NextResponse.json({ error: "Add a cover image before saving the project." }, { status: 400 });
  try {
    const collection = await getDesignProjectsCollection();
    const now = new Date();
    const record: DesignProject = { ...data, createdAt: now, updatedAt: now, publishedAt: data.status === "PUBLISHED" ? now : null };
    const result = await collection.insertOne(record);
    return NextResponse.json({ ...record, id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === 11000;
    return NextResponse.json({ error: duplicate ? "That project URL is already in use. Change the slug." : "Could not save this project." }, { status: duplicate ? 409 : 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const order = Array.isArray(body?.order) ? body.order.slice(0, 500) : [];
  if (!order.length || order.some((item: any) => typeof item?.id !== "string" || !Number.isInteger(item?.sortOrder))) {
    return NextResponse.json({ error: "A valid project order is required." }, { status: 400 });
  }
  try {
    const { ObjectId } = await import("mongodb");
    const collection = await getDesignProjectsCollection();
    const operations = order.flatMap((item: { id: string; sortOrder: number }) => {
      if (!ObjectId.isValid(item.id)) return [];
      return [{ updateOne: { filter: { _id: new ObjectId(item.id) }, update: { $set: { sortOrder: Math.max(0, Math.min(9999, item.sortOrder)), updatedAt: new Date() } } } }];
    });
    if (!operations.length) return NextResponse.json({ error: "No valid projects were supplied." }, { status: 400 });
    await collection.bulkWrite(operations);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save project order." }, { status: 503 });
  }
}
