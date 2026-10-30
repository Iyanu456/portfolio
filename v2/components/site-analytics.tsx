"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackAnalytics } from "@/lib/client-analytics";

export default function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackAnalytics({ type: "page_view", path: pathname, slug: pathname.startsWith("/shelf/") ? pathname.split("/")[2] : undefined });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest("a, button, [data-track-click]");
      if (!element || element.closest("[data-no-track]")) return;
      const label = (element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || "Interaction")
        .replace(/\s+/g, " ").trim().slice(0, 100);
      let href = "";
      if (element instanceof HTMLAnchorElement && element.href) {
        try {
          const url = new URL(element.href);
          href = url.origin === window.location.origin ? url.pathname : `${url.hostname}${url.pathname}`;
        } catch { href = ""; }
      }
      const path = window.location.pathname;
      trackAnalytics({ type: "click", path, slug: path.startsWith("/shelf/") ? path.split("/")[2] : undefined, label: label || "Interaction", target: href || element.tagName.toLowerCase() });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
