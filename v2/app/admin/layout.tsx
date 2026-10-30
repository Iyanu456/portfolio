import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Admin · Iyanu Studio", template: "%s · Iyanu Studio" }, robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-[75vh] bg-[#F5F4F0]">{children}</div>; }
