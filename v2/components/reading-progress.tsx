"use client";

import { useEffect, useState } from "react";
import { trackAnalytics } from "@/lib/client-analytics";

export default function ReadingProgress({ slug }: { slug: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sentMilestones = new Set<number>();
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const next = scrollable <= 0 ? 100 : Math.max(0, Math.min(100, (window.scrollY / scrollable) * 100));
        setProgress(next);
        for (const milestone of [25, 50, 75, 100]) {
          if (next >= milestone && !sentMilestones.has(milestone)) {
            sentMilestones.add(milestone);
            trackAnalytics({ type: "read_milestone", path: window.location.pathname, slug, milestone, label: `${milestone}% read` });
          }
        }
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slug]);

  return <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent">
    <div className="h-full origin-left bg-[#F05A28] transition-[width] duration-100 ease-out" style={{ width: `${progress}%` }} />
  </div>;
}
