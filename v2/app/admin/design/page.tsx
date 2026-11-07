import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminDesign from "@/components/admin-design";

export default async function AdminDesignPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminDesign />;
}
