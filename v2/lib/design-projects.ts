import { ObjectId, type Document } from "mongodb";
import { getCollection } from "@/lib/mongodb";

export type DesignProject = Document & {
  _id?: ObjectId;
  title: string;
  slug: string;
  category: string;
  categories?: string[];
  year: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type DesignProjectData = {
  title: string;
  slug: string;
  category: string;
  categories?: string[];
  year: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
};

const starterProjects: DesignProjectData[] = [
  {
    title: "Form & Feeling",
    slug: "form-and-feeling",
    category: "Branding",
    categories: ["Branding", "Organizations"],
    year: "2026",
    summary: "A visual identity exploring the relationship between form, feeling and everyday objects.",
    description: "An exploration of how a visual system can hold both clarity and character. This placeholder project is ready to be replaced with the final case study, process images and project story.",
    coverImage: "https://images.unsplash.com/photo-1634942536790-2534a5b0a6e5?auto=format&fit=crop&w=1800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1634942536790-2534a5b0a6e5?auto=format&fit=crop&w=1800&q=85",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1800&q=85"
    ],
    tags: ["Identity", "Art direction", "Visual systems"],
    featured: true,
    status: "PUBLISHED",
    sortOrder: 1
  },
  {
    title: "Objects of Attention",
    slug: "objects-of-attention",
    category: "Social media campaigns",
    categories: ["Social media campaigns", "Organizations"],
    year: "2025",
    summary: "A campaign concept built around considered composition, typography and visual rhythm.",
    description: "A campaign design study focused on making a simple message feel memorable. Replace this introduction with the brief, creative direction and outcomes when the finished work is ready.",
    coverImage: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1800&q=85",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1800&q=85"
    ],
    tags: ["Campaign", "Typography", "Art direction"],
    featured: true,
    status: "PUBLISHED",
    sortOrder: 2
  },
  {
    title: "A Study in Contrast",
    slug: "a-study-in-contrast",
    category: "Others",
    categories: ["Others", "Branding"],
    year: "2025",
    summary: "A digital design experiment in contrast, hierarchy and expressive visual language.",
    description: "A visual experiment in balancing restraint with expression. This starter entry can be edited from the admin dashboard or replaced with a real project.",
    coverImage: "https://images.unsplash.com/photo-1507908708918-778587c9e563?auto=format&fit=crop&w=1800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1507908708918-778587c9e563?auto=format&fit=crop&w=1800&q=85",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1800&q=85"
    ],
    tags: ["Digital", "Layout", "Experiment"],
    featured: false,
    status: "PUBLISHED",
    sortOrder: 3
  }
];

export async function getDesignProjectsCollection() {
  const collection = await getCollection<DesignProject>("design_projects");
  await Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ status: 1, featured: -1, sortOrder: 1, updatedAt: -1 }),
    collection.createIndex({ updatedAt: -1 })
  ]);
  return collection;
}

export async function ensureStarterDesignProjects() {
  const collection = await getDesignProjectsCollection();
  const count = await collection.countDocuments();
  if (count === 0) {
    const now = new Date();
    try {
      const projects: DesignProject[] = starterProjects.map((project) => ({
        ...project, createdAt: now, updatedAt: now,
        publishedAt: project.status === "PUBLISHED" ? now : null
      }));
      await collection.insertMany(projects);
    } catch (error) {
      // Another first visitor may have seeded the collection at the same time.
      if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) throw error;
    }
  }
  return collection;
}

export function serializeDesignProject(project: DesignProject) {
  const { _id, ...rest } = project;
  if (!_id) throw new Error("Cannot serialize a design project without a database ID.");
  const categories = Array.isArray(project.categories) && project.categories.length
    ? project.categories
    : [project.category || "Others"];
  return { ...rest, categories, id: _id.toString() };
}

export function asDesignProjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}
