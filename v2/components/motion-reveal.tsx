"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

export default function MotionReveal({
  children,
  className = "",
  delay = 0,
  id,
}: MotionRevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      document.documentElement.classList.add("motion-ready");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );

    observer.observe(element);
    document.documentElement.classList.add("motion-ready");

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      id={id}
      className={`motion-reveal ${className}`.trim()}
      style={{ "--motion-delay": `${Math.max(0, Math.min(delay, 500))}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
