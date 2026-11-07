import { NextResponse } from "next/server";
import { ensureStarterDesignProjects, serializeDesignProject } from "@/lib/design-projects";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await ensureStarterDesignProjects();
    const records = await projects.find({ status: "PUBLISHED" })
      .sort({ featured: -1, sortOrder: 1, publishedAt: -1 })
      .toArray();
    return NextResponse.json(records.map(serializeDesignProject), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "The design portfolio is temporarily unavailable." }, { status: 503 });
  }
}
