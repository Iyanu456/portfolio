import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import PostEditor from "@/components/post-editor";
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) redirect("/admin/login"); const { id } = await params; return <PostEditor postId={id} />; }
