import { Node, mergeAttributes } from "@tiptap/core";

export type ReaderActionKind = "like" | "comments" | "share" | "support" | "custom";

export const InlineReaderAction = Node.create({
  name: "readerAction",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      kind: { default: "support", parseHTML: element => element.getAttribute("data-reader-kind") || "support", renderHTML: attributes => ({ "data-reader-kind": attributes.kind }) },
      label: { default: "Support this work", parseHTML: element => element.getAttribute("data-reader-label") || "Support this work", renderHTML: attributes => ({ "data-reader-label": attributes.label }) },
      description: { default: "If this piece meant something to you, you can help support more writing.", parseHTML: element => element.getAttribute("data-reader-description") || "", renderHTML: attributes => ({ "data-reader-description": attributes.description }) },
      url: { default: "", parseHTML: element => element.getAttribute("data-reader-url") || "", renderHTML: attributes => ({ "data-reader-url": attributes.url }) }
    };
  },
  parseHTML() {
    return [{ tag: "div[data-reader-action]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const kind = String(HTMLAttributes["data-reader-kind"] || "support");
    const label = String(HTMLAttributes["data-reader-label"] || "Support this work");
    const url = String(HTMLAttributes["data-reader-url"] || "");
    return ["div", mergeAttributes(HTMLAttributes, {
      "data-reader-action": "true",
      "data-reader-kind": kind,
      "data-reader-label": label,
      "data-reader-url": url,
      class: "inline-reader-action",
      role: "button",
      tabindex: "0",
      "aria-label": label
    }), ["span", { class: "inline-reader-action__button" },
      ["span", { class: "inline-reader-action__button-label" }, label],
      ["span", { class: "inline-reader-action__button-arrow", "aria-hidden": "true" }, "→"]
    ]] as never;
  }
});
