import { Node, mergeAttributes } from "@tiptap/core";

/** Inline media node for uploaded, hosted video files. */
export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      title: { default: null }
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, {
      controls: "controls",
      preload: "metadata",
      playsinline: "playsinline",
      class: "article-video"
    })];
  }
});
