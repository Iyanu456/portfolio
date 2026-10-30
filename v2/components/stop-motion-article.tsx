"use client";
import { ReactNode, useEffect, useRef } from "react";

export default function StopMotionArticle({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>('figure[data-stop-motion="true"]').forEach((figure) => {
      let frames: Array<{url:string}> = [];
      try { frames = JSON.parse(figure.dataset.frames || "[]"); } catch { frames = []; }
      const image = figure.querySelector<HTMLImageElement>("img.stop-motion-frame, img");
      if (!image || frames.length < 2 || frames.some((frame) => !frame?.url)) return;
      const fps = Math.max(1, Math.min(24, Number(figure.dataset.fps) || 6));
      const shouldLoop = figure.dataset.loop !== "false";
      const fadeMs = Math.max(24, Math.min(90, Math.round(800 / fps)));
      let index = 0;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let playing = !reducedMotion;
      let visible = false;
      let timer = 0;
      let settleTimer = 0;
      let preloadPromise: Promise<void> | null = null;
      const overlay = document.createElement("img");
      overlay.className = "stop-motion-frame-overlay";
      overlay.alt = "";
      overlay.setAttribute("aria-hidden", "true");
      overlay.draggable = false;
      figure.insertBefore(overlay, figure.querySelector("figcaption") ?? null);
      const controls = document.createElement("div");
      controls.className = "stop-motion-public-controls";
      const playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "stop-motion-play-button";
      playButton.textContent = playing ? "Pause animation" : "Play animation";
      playButton.setAttribute("aria-label", playing ? "Pause stop-motion animation" : "Play stop-motion animation");
      const label = document.createElement("span");
      label.className = "stop-motion-public-label";
      label.textContent = `${frames.length} frames · ${fps} fps`;
      controls.append(playButton, label);
      figure.appendChild(controls);
      const tick = () => {
        const next = index + 1;
        if (next >= frames.length && !shouldLoop) { stop(); return; }
        index = next >= frames.length ? 0 : next;
        overlay.style.animation = "none";
        overlay.style.opacity = "0";
        overlay.src = frames[index].url;
        // Force a style flush so the crossfade restarts for each new frame.
        void overlay.offsetWidth;
        overlay.style.animation = `stop-motion-crossfade ${fadeMs}ms ease-out both`;
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          image.src = frames[index].url;
          overlay.style.animation = "none";
          overlay.style.opacity = "0";
        }, fadeMs + 8);
      };
      const start = () => {
        window.clearInterval(timer);
        if (!playing || !visible) return;
        timer = window.setInterval(tick, 1000 / fps);
      };
      const stop = () => { window.clearInterval(timer); timer = 0; };
      const preload = () => {
        if (preloadPromise) return preloadPromise;
        preloadPromise = Promise.all(frames.map((frame) => new Promise<void>((resolve) => {
          const preloadImage = new window.Image();
          preloadImage.decoding = "async";
          preloadImage.onload = () => resolve();
          preloadImage.onerror = () => resolve();
          preloadImage.src = frame.url;
          if (preloadImage.complete) resolve();
        }))).then(() => undefined);
        return preloadPromise;
      };
      const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
        visible = Boolean(entries[0]?.isIntersecting);
        if (visible) { if (playing) void preload().then(start); else stop(); } else stop();
      }, { rootMargin: "200px 0px" }) : null;
      if (observer) observer.observe(figure);
      else { visible = true; if (playing) void preload().then(start); else stop(); }
      const handlePlayClick = () => {
        playing = !playing;
        if (playing) { if (index >= frames.length - 1 && !shouldLoop) { index = 0; image.src = frames[0].url; } void preload().then(start); }
        else stop();
        playButton.textContent = playing ? "Pause animation" : "Play animation";
        playButton.setAttribute("aria-label", playing ? "Pause stop-motion animation" : "Play stop-motion animation");
      };
      playButton.addEventListener("click", handlePlayClick);
      cleanups.push(() => { stop(); window.clearTimeout(settleTimer); observer?.disconnect(); playButton.removeEventListener("click", handlePlayClick); overlay.remove(); controls.remove(); });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  return <div ref={container}>{children}</div>;
}
