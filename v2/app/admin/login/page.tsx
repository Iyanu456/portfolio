import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/admin-login";
export default async function AdminLoginPage() { if (await isAdmin()) redirect("/admin"); return <AdminLogin />; }
