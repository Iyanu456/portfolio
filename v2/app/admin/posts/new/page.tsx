import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import PostEditor from "@/components/post-editor";
export default async function NewPostPage() { if (!(await isAdmin())) redirect("/admin/login"); return <PostEditor />; }
