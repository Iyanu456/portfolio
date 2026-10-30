import { ObjectId, type Document } from "mongodb";
import { getCollection } from "@/lib/mongodb";

export type ActionButtonRecord = { id: string; kind: "subscribe" | "like" | "comments" | "share" | "support" | "custom"; label: string; description: string; url: string; enabled: boolean };

export type PostRecord = Document & {
  _id?: ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  contentHtml: string;
  actionButtons?: ActionButtonRecord[];
  emailSubscribersOnPublish?: boolean;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function serializePost(post: PostRecord & Document) {
  const { _id, ...rest } = post;
  return { ...rest, id: _id?.toString() };
}

export async function ensurePostIndexes() {
  const posts = await getCollection<PostRecord>("posts");
  await Promise.all([
    posts.createIndex({ slug: 1 }, { unique: true }),
    posts.createIndex({ status: 1, publishedAt: -1 }),
    posts.createIndex({ updatedAt: -1 })
  ]);
  return posts;
}

export function asObjectId(id: string) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}
