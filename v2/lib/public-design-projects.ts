import { ensureStarterDesignProjects, serializeDesignProject } from "@/lib/design-projects";

export async function getPublicDesignProjects() {
  const collection = await ensureStarterDesignProjects();
  const projects = await collection.find({ status: "PUBLISHED" })
    .sort({ sortOrder: 1, featured: -1, publishedAt: -1 })
    .toArray();
  return projects.map(serializeDesignProject);
}

export async function getPublicDesignProject(slug: string) {
  const collection = await ensureStarterDesignProjects();
  const project = await collection.findOne({ slug, status: "PUBLISHED" });
  return project ? serializeDesignProject(project) : null;
}
