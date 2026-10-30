import { redirect } from "next/navigation";
type Context = { params: Promise<{ slug: string }> };
export default async function LegacyArticlePage({ params }: Context) {
  const { slug } = await params;
  redirect(`/shelf/${slug}`);
}
