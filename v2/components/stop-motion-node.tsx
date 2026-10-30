import { useEffect, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { Pause, Play, RotateCcw, Trash2, Pencil } from "lucide-react";
import { CustomDropdown } from "@/components/custom-dropdown";

export type StopMotionFrame = { url: string; name?: string };

function parseFrames(value: unknown): StopMotionFrame[] {
  if (Array.isArray(value)) return value.filter((item): item is StopMotionFrame => Boolean(item && typeof item.url === "string"));
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.url === "string") : []; }
    catch { return []; }
  }
  return [];
}

function StopMotionNodeView({ node, updateAttributes, deleteNode, selected, getPos }: NodeViewProps) {
  const frames = parseFrames(node.attrs.frames);
  const fps = Math.max(1, Math.min(24, Number(node.attrs.fps) || 6));
  const [index, setIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing || frames.length < 2) return;
    frames.forEach((frame) => { const image = new window.Image(); image.decoding = "async"; image.src = frame.url; });
    const timer = window.setInterval(() => setIndex((current) => {
      if (current >= frames.length - 1 && node.attrs.loop === false) { setPlaying(false); return current; }
      const next = (current + 1) % frames.length;
      setPreviousIndex(current);
      return next;
    }), 1000 / fps);
    return () => window.clearInterval(timer);
  }, [playing, frames.length, fps, node.attrs.loop]);
  useEffect(() => { setIndex(0); setPreviousIndex(0); }, [node.attrs.frames]);
  return <NodeViewWrapper className={`stop-motion-editor-card ${selected ? "is-selected" : ""}`}>
    <div className="stop-motion-editor-media">
      {frames.length ? <img key={`${index}-${frames[index]?.url}`} className="stop-motion-frame-current" src={frames[index]?.url || frames[0].url} alt={node.attrs.alt || "Stop-motion animation preview"} /> : <div className="stop-motion-empty">Add at least two frames to build an animation.</div>}
      <span className="stop-motion-frame-count">{frames.length} frames · {fps} fps</span>
    </div>
    <div className="stop-motion-editor-controls">
      <span className="stop-motion-editor-label">Stop-motion animation</span>
      <div className="stop-motion-editor-buttons">
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause preview" : "Play preview"} title={playing ? "Pause preview" : "Play preview"}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
        <button type="button" onClick={() => { setIndex(0); setPlaying(true); }} aria-label="Restart preview" title="Restart preview"><RotateCcw size={14} /></button>
        <button type="button" onClick={() => updateAttributes({ loop: !node.attrs.loop })} className={node.attrs.loop ? "active" : ""} title={node.attrs.loop ? "Loop enabled" : "Loop disabled"}>Loop</button>
        <button type="button" onClick={() => { const position = typeof getPos === "function" ? getPos() : undefined; if (typeof window !== "undefined" && typeof position === "number") window.dispatchEvent(new CustomEvent("edit-stop-motion-animation", { detail: { position, frames, fps, loop: node.attrs.loop !== false, alt: String(node.attrs.alt || "") } })); }} aria-label="Edit animation frames" title="Edit animation frames"><Pencil size={14} /></button>
        <button type="button" onClick={deleteNode} aria-label="Remove animation" title="Remove animation" className="danger"><Trash2 size={14} /></button>
      </div>
    </div>
    <div className="stop-motion-editor-settings">
      <label className="stop-motion-speed-label">Speed <CustomDropdown size="sm" ariaLabel="Animation speed" value={String(fps)} onChange={(value) => updateAttributes({ fps: Number(value) })} options={[{value:"2",label:"2 fps"},{value:"4",label:"4 fps"},{value:"6",label:"6 fps"},{value:"8",label:"8 fps"},{value:"10",label:"10 fps"},{value:"12",label:"12 fps"},{value:"16",label:"16 fps"},{value:"24",label:"24 fps"}]}/></label>
      <label className="stop-motion-alt-label">Alt text <input value={node.attrs.alt || ""} onChange={(event) => updateAttributes({ alt: event.target.value })} placeholder="Describe the animation" /></label>
    </div>
  </NodeViewWrapper>;
}

export const StopMotionNode = Node.create({
  name: "stopMotion",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      frames: { default: [], parseHTML: (element) => parseFrames(element.getAttribute("data-frames")), renderHTML: () => ({}) },
      fps: { default: 6, parseHTML: (element) => Number(element.getAttribute("data-fps")) || 6, renderHTML: () => ({}) },
      loop: { default: true, parseHTML: (element) => element.getAttribute("data-loop") !== "false", renderHTML: () => ({}) },
      alt: { default: "", parseHTML: (element) => element.getAttribute("data-alt") || "", renderHTML: () => ({}) }
    };
  },
  parseHTML() { return [{ tag: 'figure[data-stop-motion="true"]' }]; },
  renderHTML({ HTMLAttributes, node }) {
    const frames = parseFrames(node.attrs.frames);
    return ["figure", mergeAttributes(HTMLAttributes, {
      "data-stop-motion": "true",
      "data-frames": JSON.stringify(frames),
      "data-fps": String(node.attrs.fps || 6),
      "data-loop": node.attrs.loop === false ? "false" : "true",
      "data-alt": String(node.attrs.alt || ""),
      class: "stop-motion-figure"
    }),
      ["img", { src: frames[0]?.url || "", alt: String(node.attrs.alt || "Stop-motion animation"), class: "stop-motion-frame", loading: "lazy" }],
      ["figcaption", { class: "stop-motion-caption" }, `Stop-motion sequence · ${frames.length} frames`]
    ];
  },
  addNodeView() { return ReactNodeViewRenderer(StopMotionNodeView); }
});
