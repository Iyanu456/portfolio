import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import SiteAnalytics from "@/components/site-analytics";
import SubscriptionStatusSync from "@/components/subscription-status-sync";

export const metadata: Metadata = {
  title: {
    default: "Iyanu Oyerinde — A place for ideas to take shape",
    template: "%s — Iyanu Oyerinde"
  },
  description:
    "Writing, ideas, observations, and work by Iyanu Oyerinde. A personal publication exploring whatever is worth thinking about.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  openGraph: {
    title: "Iyanu Oyerinde",
    description: "A place for ideas to take shape.",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Iyanu Oyerinde — A place for ideas to take shape" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-default.png"] }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteAnalytics />
        <SubscriptionStatusSync />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
