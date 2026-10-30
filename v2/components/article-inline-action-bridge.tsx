"use client";
import { ReactNode, useEffect, useRef } from "react";

export default function ArticleInlineActionBridge({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const activate = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const action = target.closest<HTMLElement>("[data-reader-action='true']");
      if (!action || !element.contains(action)) return;
      const kind = action.dataset.readerKind || "support";
      if (kind === "support") window.dispatchEvent(new CustomEvent("iyanu:open-support"));
      else if (["like", "comments", "share"].includes(kind)) window.dispatchEvent(new CustomEvent("iyanu:open-interaction", { detail: { mode: kind } }));
      else if (kind === "custom") {
        const url = action.dataset.readerUrl || "";
        try { const parsed = new URL(url); if (parsed.protocol === "https:" || parsed.protocol === "http:") window.open(parsed.toString(), "_blank", "noopener,noreferrer"); } catch { /* Ignore invalid editor-supplied links. */ }
      }
    };
    // Hydrate editor-authored stop-motion frame sequences on the published article.
    const animationCleanups: Array<() => void> = [];
    element.querySelectorAll<HTMLElement>('figure[data-stop-motion="true"]').forEach((figure) => {
      let frames: Array<{ url: string }> = [];
      try { frames = JSON.parse(figure.dataset.frames || "[]"); } catch { frames = []; }
      const image = figure.querySelector<HTMLImageElement>("img.stop-motion-frame, img");
      if (!image || frames.length < 2 || frames.some((frame) => !frame?.url)) return;
      const fps = Math.max(1, Math.min(24, Number(figure.dataset.fps) || 6));
      const loops = figure.dataset.loop !== "false";
      let index = 0;
      let playing = true;
      let timer: number | undefined;
      const controls = document.createElement("div");
      controls.className = "stop-motion-public-controls";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stop-motion-play-button";
      button.textContent = "Pause animation";
      button.setAttribute("aria-label", "Pause stop-motion animation");
      const label = document.createElement("span");
      label.className = "stop-motion-public-label";
      label.textContent = `${frames.length} frames · ${fps} fps`;
      controls.append(button, label);
      // Keep the playback bar inside the media block, directly below the frame
      // and before its caption, rather than letting it read like article copy.
      figure.insertBefore(controls, figure.querySelector("figcaption"));
      const stop = () => { if (timer !== undefined) window.clearInterval(timer); timer = undefined; };
      const tick = () => {
        if (index >= frames.length - 1) {
          if (!loops) {
            stop(); playing = false; button.textContent = "Play animation";
            button.setAttribute("aria-label", "Play stop-motion animation"); return;
          }
          index = 0;
        } else index += 1;
        image.src = frames[index].url;
      };
      const start = () => { stop(); timer = window.setInterval(tick, 1000 / fps); };
      button.addEventListener("click", () => {
        playing = !playing;
        if (playing) { if (!loops && index >= frames.length - 1) { index = 0; image.src = frames[0].url; } start(); }
        else stop();
        button.textContent = playing ? "Pause animation" : "Play animation";
        button.setAttribute("aria-label", playing ? "Pause stop-motion animation" : "Play stop-motion animation");
      });
      start();
      animationCleanups.push(() => { stop(); button.replaceWith(button.cloneNode(true)); controls.remove(); });
    });
    const click = (event: Event) => activate(event.target);
    const keydown = (event: Event) => {
      const keyboard = event as KeyboardEvent;
      if (keyboard.key !== "Enter" && keyboard.key !== " ") return;
      const target = keyboard.target;
      if (target instanceof Element && target.closest("[data-reader-action='true']")) { keyboard.preventDefault(); activate(target); }
    };
    element.addEventListener("click", click);
    element.addEventListener("keydown", keydown);
    return () => { element.removeEventListener("click", click); element.removeEventListener("keydown", keydown); animationCleanups.forEach((cleanup) => cleanup()); };
  }, []);
  return <div ref={container}>{children}</div>;
}
