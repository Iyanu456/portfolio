import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import SiteAnalytics from "@/components/site-analytics";
import SubscriptionStatusSync from "@/components/subscription-status-sync";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Iyanu Oyerinde — A place for ideas to take shape",
    template: "%s — Iyanu Oyerinde",
  },
  description:
    "Explore essays, ideas, observations, and creative work by Iyanu Oyerinde across design, architecture, technology, and culture.",
  applicationName: "Iyanu Oyerinde",
  authors: [{ name: "Iyanu Oyerinde", url: siteUrl }],
  creator: "Iyanu Oyerinde",
  publisher: "Iyanu Oyerinde",
  category: "Personal publication",
  keywords: [
    "Iyanu Oyerinde", "essays", "ideas", "design", "architecture",
    "technology", "creativity", "culture", "personal publication",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Iyanu Oyerinde — A place for ideas to take shape",
    description:
      "Essays, ideas, observations, and creative work across design, architecture, technology, and culture.",
    url: "/",
    siteName: "Iyanu Oyerinde",
    locale: "en_US",
    type: "website",
    images: [{
      url: "/og-default.png",
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "Iyanu Oyerinde — A place for ideas to take shape",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iyanu Oyerinde — A place for ideas to take shape",
    description: "Essays, ideas, observations, and creative work by Iyanu Oyerinde.",
    images: [{ url: "/og-default.png", alt: "Iyanu Oyerinde" }],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
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
