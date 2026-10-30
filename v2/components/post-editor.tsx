"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
const EditableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) =>
          element.getAttribute("data-image-width") ||
          element.style.width ||
          "100%",
        renderHTML: (attributes) => ({
          "data-image-width": attributes.width,
          style: `width: ${attributes.width}; max-width: 100%;`,
        }),
      },
      align: {
        default: "left",
        parseHTML: (element) =>
          element.getAttribute("data-image-align") || "left",
        renderHTML: (attributes) => ({ "data-image-align": attributes.align }),
      },
    };
  },
});
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { VideoNode } from "@/components/video-extension";
import {
  looksLikeMarkdown,
  markdownToEditorHtml,
} from "@/components/markdown-paste";
import { InlineReaderAction } from "@/components/inline-reader-action";
import {
  StopMotionNode,
  type StopMotionFrame,
} from "@/components/stop-motion-node";
import { CustomDropdown } from "@/components/custom-dropdown";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  ImagePlus,
  Link2,
  Minus,
  Undo2,
  Redo2,
  Eye,
  Save,
  Upload,
  LoaderCircle,
  Video as VideoIcon,
  Heart,
  Coffee,
  HandHeart,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Film,
  Play,
  Pause,
  RotateCcw,
  GripVertical,
  MousePointerClick,
  Clock3,
} from "lucide-react";
type ActionButton = {
  id: string;
  kind: "subscribe" | "like" | "comments" | "share" | "support" | "custom";
  label: string;
  description: string;
  url: string;
  enabled: boolean;
};
type PostData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  contentHtml: string;
  status: string;
  actionButtons: ActionButton[];
};
const blank: PostData = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Ideas & observations",
  coverImage: null,
  contentHtml: "<p></p>",
  status: "DRAFT",
  actionButtons: [],
};
const presets: Omit<ActionButton, "id">[] = [
  {
    kind: "subscribe",
    label: "Enjoying what you're reading? Subscribe.",
    description: "Get new writing delivered when I publish.",
    url: "",
    enabled: true,
  },
  {
    kind: "like",
    label: "Like this article",
    description: "Let me know this resonated with you.",
    url: "",
    enabled: true,
  },
  {
    kind: "comments",
    label: "Join the conversation",
    description: "Share a thought with me and other readers.",
    url: "",
    enabled: true,
  },
  {
    kind: "share",
    label: "Share this piece",
    description: "Pass the article along to someone who might enjoy it.",
    url: "",
    enabled: true,
  },
  {
    kind: "support",
    label: "Buy me a coffee",
    description:
      "If this gave you something to think about, help keep the ideas coming.",
    url: "",
    enabled: true,
  },
];
function newAction(action: Omit<ActionButton, "id">): ActionButton {
  return {
    ...action,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
  };
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<PostData>(blank);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [sendToSubscribers, setSendToSubscribers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [coverUploading, setCoverUploading] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [animationBuilderOpen, setAnimationBuilderOpen] = useState(false);
  const [editingAnimationPosition, setEditingAnimationPosition] = useState<
    number | null
  >(null);
  const [animationFrames, setAnimationFrames] = useState<StopMotionFrame[]>([]);
  const [animationFps, setAnimationFps] = useState(6);
  const [animationLoop, setAnimationLoop] = useState(true);
  const [animationAlt, setAnimationAlt] = useState("");
  const [animationUploading, setAnimationUploading] = useState(false);
  const [animationPreviewIndex, setAnimationPreviewIndex] = useState(0);
  const [animationPreviousIndex, setAnimationPreviousIndex] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(true);
  const [draggingAnimationFrame, setDraggingAnimationFrame] = useState<
    number | null
  >(null);
  const [dragOverAnimationFrame, setDragOverAnimationFrame] = useState<
    number | null
  >(null);
  const [inlineActionModalOpen, setInlineActionModalOpen] = useState(false);
  const [inlineActionKind, setInlineActionKind] = useState<
    "support" | "like" | "comments" | "share" | "custom"
  >("support");
  const [inlineActionLabel, setInlineActionLabel] = useState("Buy me a coffee");
  const [inlineActionUrl, setInlineActionUrl] = useState("");
  const [selectedImageActive, setSelectedImageActive] = useState(false);
  const [selectedImageAlt, setSelectedImageAlt] = useState("");
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      EditableImage.configure({ inline: false, allowBase64: false }),
      VideoNode,
      StopMotionNode,
      InlineReaderAction,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "editor-link" },
      }),
      Placeholder.configure({
        placeholder: "Start with the thought you want to explore…",
      }),
    ],
    content: blank.contentHtml,
    immediatelyRender: false,
    onSelectionUpdate: ({ editor }) => {
      const selected = editor.isActive("image");
      setSelectedImageActive(selected);
      setSelectedImageAlt(
        selected ? String(editor.getAttributes("image").alt || "") : "",
      );
    },
    editorProps: {
      attributes: {
        class:
          "article-editor min-h-[360px] px-5 py-6 outline-none sm:px-8 sm:py-8",
      },
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;
        const markdown =
          clipboard.getData("text/markdown") || clipboard.getData("text/plain");
        if (!markdown || !looksLikeMarkdown(markdown)) return false;
        event.preventDefault();
        const html = markdownToEditorHtml(markdown);
        if (html) editorRef.current?.chain().focus().insertContent(html).run();
        setNotice(
          "Markdown pasted and formatted. Review headings, links, and lists before publishing.",
        );
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter(
          (file) => file.type.startsWith("image/"),
        );
        if (!files.length) return false;
        event.preventDefault();
        const position =
          view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ??
          view.state.selection.from;
        setUploading(true);
        setError("");
        setNotice("");
        void (async () => {
          try {
            const nodes = await Promise.all(
              files.map(async (file) => {
                const form = new FormData();
                form.append("file", file);
                const response = await fetch("/api/admin/upload", {
                  method: "POST",
                  body: form,
                });
                const result = await response.json();
                if (!response.ok)
                  throw new Error(
                    result.error || `Could not upload ${file.name}`,
                  );
                return {
                  type: "image",
                  attrs: {
                    src: result.url,
                    alt: file.name.replace(/\.[^.]+$/, ""),
                  },
                };
              }),
            );
            editorRef.current
              ?.chain()
              .focus()
              .insertContentAt(position, nodes)
              .run();
            setNotice(
              `${nodes.length} image${nodes.length === 1 ? "" : "s"} dropped into the article.`,
            );
          } catch (uploadError) {
            setError(
              uploadError instanceof Error
                ? uploadError.message
                : "Could not upload dropped images.",
            );
          } finally {
            setUploading(false);
          }
        })();
        return true;
      },
    },
  });
  editorRef.current = editor;
  useEffect(() => {
    if (!postId) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/admin/posts/${postId}`);
        if (r.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not load post");
        if (alive) {
          setData({
            ...blank,
            ...d,
            actionButtons: Array.isArray(d.actionButtons)
              ? d.actionButtons
              : [],
          });
          setSendToSubscribers(d.emailSubscribersOnPublish === true);
          setSlugTouched(true);
          editor?.commands.setContent(d.contentHtml || "<p></p>");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load post.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId, router, editor]);
  useEffect(() => {
    const handleEditAnimation = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          position: number;
          frames: StopMotionFrame[];
          fps: number;
          loop: boolean;
          alt: string;
        }>
      ).detail;
      if (
        !detail ||
        !Number.isInteger(detail.position) ||
        !Array.isArray(detail.frames)
      )
        return;
      setEditingAnimationPosition(detail.position);
      setAnimationFrames(detail.frames.map((frame) => ({ ...frame })));
      setAnimationFps(Math.max(1, Math.min(24, Number(detail.fps) || 6)));
      setAnimationLoop(detail.loop !== false);
      setAnimationAlt(detail.alt || "");
      setAnimationPreviewIndex(0);
      setAnimationPreviousIndex(0);
      setAnimationPlaying(true);
      setDraggingAnimationFrame(null);
      setDragOverAnimationFrame(null);
      setError("");
      setNotice("");
      setAnimationBuilderOpen(true);
    };
    window.addEventListener("edit-stop-motion-animation", handleEditAnimation);
    return () =>
      window.removeEventListener(
        "edit-stop-motion-animation",
        handleEditAnimation,
      );
  }, []);
  const setField = (key: keyof PostData, value: string | null) =>
    setData((prev) => ({ ...prev, [key]: value }));
  const toggle = (fn: () => void) => {
    if (editor) fn();
  };
  const uploadMedia = useCallback(
    async (file: File, alt: string, kind: "image" | "video") => {
      setUploading(true);
      setError("");
      try {
        const form = new FormData();
        form.append("file", file);
        const r = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Media upload failed");
        if (kind === "video") {
          editor
            ?.chain()
            .focus()
            .insertContent({
              type: "video",
              attrs: { src: d.url, title: file.name },
            })
            .run();
          setNotice("Video inserted.");
        } else {
          editor
            ?.chain()
            .focus()
            .setImage({ src: d.url, alt: alt.trim() || file.name })
            .run();
          setNotice(
            file.type === "image/gif" ? "GIF inserted." : "Image inserted.",
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Media upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );
  async function insertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const alt = window.prompt(
          "Describe this image for accessibility (alt text):",
          file.name.replace(/\.[^.]+$/, ""),
        );
        if (alt !== null) void uploadMedia(file, alt, "image");
      }
    };
    input.click();
  }
  function editSelectedImageAlt() {
    if (!editor?.isActive("image")) {
      setNotice(
        "Select an image or GIF in the article first, then edit its alt text.",
      );
      return;
    }
    const current = String(editor.getAttributes("image").alt || "");
    const alt = window.prompt(
      "Describe this image or GIF for accessibility (alt text):",
      current,
    );
    if (alt !== null) {
      editor
        .chain()
        .focus()
        .updateAttributes("image", { alt: alt.trim() })
        .run();
      setSelectedImageAlt(alt.trim());
      setNotice("Image alt text updated. Save the article to keep the change.");
    }
  }
  function applySelectedImageAlt() {
    if (!editor || !selectedImageActive) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", { alt: selectedImageAlt.trim() })
      .run();
    setNotice("Image alt text updated. Save the article to keep the change.");
  }
  async function insertVideo() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/quicktime,video/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void uploadMedia(file, "", "video");
    };
    input.click();
  }
  async function addAnimationFrames(files: FileList | File[]) {
    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!selected.length) {
      setError("Choose image files for the animation frames.");
      return;
    }
    setAnimationUploading(true);
    setError("");
    setNotice("");
    const uploaded: StopMotionFrame[] = [];
    try {
      for (const file of selected) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || `Could not upload ${file.name}`);
        uploaded.push({ url: result.url, name: file.name });
        setAnimationFrames((current) => [
          ...current,
          { url: result.url, name: file.name },
        ]);
      }
      setNotice(
        `${uploaded.length} frame${uploaded.length === 1 ? "" : "s"} uploaded. Add more or reorder them before inserting.`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Frame upload failed. Any frames uploaded before the error have been kept.",
      );
    } finally {
      setAnimationUploading(false);
    }
  }
  function chooseAnimationFrames() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length) void addAnimationFrames(input.files);
    };
    input.click();
  }
  function reorderAnimationFrames(from: number, to: number) {
    if (from === to) return;
    setAnimationFrames((current) => {
      if (from < 0 || to < 0 || from >= current.length || to >= current.length)
        return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setAnimationPreviewIndex((current) => {
      if (current === from) return to;
      if (from < current && to >= current) return current - 1;
      if (from > current && to <= current) return current + 1;
      return current;
    });
  }
  function handleFrameDragStart(
    event: ReactDragEvent<HTMLDivElement>,
    index: number,
  ) {
    setDraggingAnimationFrame(index);
    setDragOverAnimationFrame(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
  function handleFrameDrop(
    event: ReactDragEvent<HTMLDivElement>,
    targetIndex: number,
  ) {
    event.preventDefault();
    const from =
      draggingAnimationFrame ??
      Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(from)) reorderAnimationFrames(from, targetIndex);
    setDraggingAnimationFrame(null);
    setDragOverAnimationFrame(null);
  }
  function removeAnimationFrame(index: number) {
    setAnimationFrames((current) =>
      current.filter((_, frameIndex) => frameIndex !== index),
    );
    setAnimationPreviewIndex((current) =>
      current === index
        ? Math.max(0, index - 1)
        : current > index
          ? current - 1
          : current,
    );
  }
  function openNewAnimationBuilder() {
    setEditingAnimationPosition(null);
    setAnimationFrames([]);
    setAnimationFps(6);
    setAnimationLoop(true);
    setAnimationAlt("");
    setAnimationPreviewIndex(0);
    setAnimationPreviousIndex(0);
    setAnimationPlaying(true);
    setError("");
    setNotice("");
    setAnimationBuilderOpen(true);
  }
  function insertStopMotion() {
    if (!editor) return;
    if (animationFrames.length < 2) {
      setError("Upload at least two frames to create a stop-motion animation.");
      return;
    }
    const attrs = {
      frames: animationFrames,
      fps: animationFps,
      loop: animationLoop,
      alt: animationAlt.trim(),
    };
    if (editingAnimationPosition !== null) {
      const position = editingAnimationPosition;
      const updated = editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          const existing = state.doc.nodeAt(position);
          if (!existing || existing.type.name !== "stopMotion") return false;
          tr.setNodeMarkup(position, undefined, {
            ...existing.attrs,
            ...attrs,
          });
          return true;
        })
        .run();
      if (!updated) {
        setError(
          "Could not find this animation in the article. Close the editor and try selecting Edit again.",
        );
        return;
      }
    } else {
      editor.chain().focus().insertContent({ type: "stopMotion", attrs }).run();
    }
    const wasEditing = editingAnimationPosition !== null;
    setAnimationBuilderOpen(false);
    setEditingAnimationPosition(null);
    setAnimationFrames([]);
    setAnimationAlt("");
    setAnimationPreviewIndex(0);
    setAnimationPreviousIndex(0);
    setAnimationPlaying(true);
    setNotice(
      wasEditing
        ? "Animation updated. Save or publish the article to make the changes visible to readers."
        : "Stop-motion animation inserted. Save or publish the article to make it visible to readers.",
    );
  }
  useEffect(() => {
    if (
      !animationBuilderOpen ||
      !animationPlaying ||
      animationFrames.length < 2
    )
      return;
    const timer = window.setInterval(
      () =>
        setAnimationPreviewIndex((current) => {
          const next =
            current >= animationFrames.length - 1
              ? animationLoop
                ? 0
                : current
              : current + 1;
          if (next !== current) setAnimationPreviousIndex(current);
          return next;
        }),
      1000 / animationFps,
    );
    return () => window.clearInterval(timer);
  }, [
    animationBuilderOpen,
    animationFrames.length,
    animationFps,
    animationLoop,
    animationPlaying,
  ]);
  useEffect(() => {
    if (
      animationBuilderOpen &&
      animationPlaying &&
      !animationLoop &&
      animationFrames.length > 1 &&
      animationPreviewIndex >= animationFrames.length - 1
    )
      setAnimationPlaying(false);
  }, [
    animationBuilderOpen,
    animationFrames.length,
    animationLoop,
    animationPlaying,
    animationPreviewIndex,
  ]);
  function insertImageUrl() {
    if (!editor) return;
    const url = window.prompt("Paste an image or GIF URL", "https://");
    if (!url || !/^https?:\/\//i.test(url.trim())) return;
    const alt =
      window.prompt("Describe this image for accessibility (alt text):", "") ||
      "";
    editor.chain().focus().setImage({ src: url.trim(), alt }).run();
  }
  function insertLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter the link URL", previous || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }
  function insertInlineAction() {
    if (!editor) return;
    setError("");
    setInlineActionKind("support");
    setInlineActionLabel("Buy me a coffee");
    setInlineActionUrl("");
    setInlineActionModalOpen(true);
  }
  function commitInlineAction() {
    if (!editor || !inlineActionLabel.trim()) return;
    if (
      inlineActionKind === "custom" &&
      !/^https?:\/\//i.test(inlineActionUrl.trim())
    ) {
      setError("Add a valid http(s) destination URL for a custom button.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "readerAction",
        attrs: {
          kind: inlineActionKind,
          label: inlineActionLabel.trim().slice(0, 100),
          description: "",
          url: inlineActionKind === "custom" ? inlineActionUrl.trim() : "",
        },
      })
      .run();
    setInlineActionModalOpen(false);
    setNotice(
      "Button inserted at your cursor position. Select it in the article to move it with the surrounding content.",
    );
  }
  function changeInlineActionKind(
    kind: "support" | "like" | "comments" | "share" | "custom",
  ) {
    setInlineActionKind(kind);
    const defaults = {
      support: "Buy me a coffee",
      like: "Leave a like",
      comments: "Join the conversation",
      share: "Share this piece",
      custom: "Explore this further",
    };
    setInlineActionLabel(defaults[kind]);
    if (kind !== "custom") setInlineActionUrl("");
  }
  async function uploadCover(file: File) {
    setCoverUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Cover upload failed");
      setField("coverImage", d.url);
      setNotice("Cover image uploaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cover upload failed.");
    } finally {
      setCoverUploading(false);
    }
  }
  function addAction(preset?: Omit<ActionButton, "id">) {
    setData((prev) => ({
      ...prev,
      actionButtons: [
        ...prev.actionButtons,
        newAction(
          preset || {
            kind: "custom",
            label: "Explore more",
            description: "",
            url: "",
            enabled: true,
          },
        ),
      ],
    }));
    setShowActions(true);
  }
  function updateAction(
    id: string,
    key: keyof Omit<ActionButton, "id">,
    value: string | boolean,
  ) {
    setData((prev) => ({
      ...prev,
      actionButtons: prev.actionButtons.map((a) =>
        a.id === id ? { ...a, [key]: value } : a,
      ),
    }));
  }
  function removeAction(id: string) {
    setData((prev) => ({
      ...prev,
      actionButtons: prev.actionButtons.filter((a) => a.id !== id),
    }));
  }
  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!editor) return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      title: data.title.trim(),
      slug: (data.slug || slugify(data.title)).trim(),
      excerpt: data.excerpt.trim(),
      category: data.category,
      coverImage: data.coverImage,
      contentHtml: editor.getHTML(),
      status,
      actionButtons: data.actionButtons,
      sendToSubscribers,
    };
    try {
      const url = postId ? `/api/admin/posts/${postId}` : "/api/admin/posts";
      const r = await fetch(url, {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save post");
      setData({ ...d });
      setSlugTouched(true);
      setNotice(
        status === "PUBLISHED"
          ? d.emailBroadcast
            ? !d.emailBroadcast.configured
              ? "Post published, but subscriber email is not configured or the email service failed. Check BREVO_API_KEY, BREVO_SENDER_EMAIL, and server logs."
              : d.emailBroadcast.total === 0
                ? "Post published. There are no active subscribers to email."
                : d.emailBroadcast.sent === d.emailBroadcast.total
                  ? `Post published. Email sent to all ${d.emailBroadcast.total} subscribers.`
                  : `Post published, but only ${d.emailBroadcast.sent} of ${d.emailBroadcast.total} subscriber emails were sent. Check Brevo configuration and logs.`
            : "Post published."
          : "Draft saved.",
      );
      if (!postId) router.replace(`/admin/posts/${d.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-neutral-500">
        Loading editor…
      </div>
    );
  const tools = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive("italic"),
    },
    {
      label: "Underline",
      icon: UnderlineIcon,
      action: () => editor?.chain().focus().toggleUnderline().run(),
      active: editor?.isActive("underline"),
    },
    {
      label: "Heading 1",
      icon: Heading1,
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor?.isActive("heading", { level: 1 }),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor?.isActive("heading", { level: 2 }),
    },
    {
      label: "Bullet list",
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive("bulletList"),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      active: editor?.isActive("orderedList"),
    },
    {
      label: "Blockquote",
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      active: editor?.isActive("blockquote"),
    },
    {
      label: "Align left",
      icon: AlignLeft,
      action: () => editor?.chain().focus().setTextAlign("left").run(),
      active: editor?.getAttributes("paragraph").textAlign === "left",
    },
    {
      label: "Align center",
      icon: AlignCenter,
      action: () => editor?.chain().focus().setTextAlign("center").run(),
      active: editor?.getAttributes("paragraph").textAlign === "center",
    },
    {
      label: "Align right",
      icon: AlignRight,
      action: () => editor?.chain().focus().setTextAlign("right").run(),
      active: editor?.getAttributes("paragraph").textAlign === "right",
    },
    {
      label: "Insert link",
      icon: Link2,
      action: insertLink,
      active: editor?.isActive("link"),
    },
    {
      label: "Divider",
      icon: Minus,
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      active: false,
    },
  ];
  return (
    <div
      className={`mx-auto ${focusMode ? "max-w-4xl" : "max-w-6xl"} px-5 py-7 sm:px-8 sm:py-10`}
    >
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-ink"
        >
          <ArrowLeft size={15} /> All posts
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFocusMode((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm"
          >
            <Type size={14} />
            {focusMode ? "Exit focus" : "Focus mode"}
          </button>
          <button
            onClick={() => save("DRAFT")}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm disabled:opacity-50"
          >
            <Save size={14} /> Save draft
          </button>
          <button
            onClick={() => save("PUBLISHED")}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-white hover:bg-[#F05A28] disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Eye size={14} />
            )}{" "}
            {data.status === "PUBLISHED" ? "Update & publish" : "Publish"}
          </button>
        </div>
      </header>
      <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm">
        <input
          type="checkbox"
          checked={sendToSubscribers}
          onChange={(event) => setSendToSubscribers(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#F05A28]"
        />
        <span>
          <span className="block font-medium text-neutral-800">
            Email this post to all active subscribers
          </span>
          <span className="mt-1 block text-xs leading-5 text-neutral-500">
            When enabled, the article is emailed once when it is first
            published. You can turn this off for any post.
          </span>
        </span>
      </label>
      <div className="space-y-6">
        <section className="min-w-0 overflow-visible rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#F05A28]">
              {postId ? "Edit article" : "New article"}
            </p>
          </div>
          <div className="space-y-4 p-5 sm:p-8">
            <textarea
              rows={1}
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
              value={data.title}
              onChange={(e) => {
                const title = e.target.value;
                setData((prev) => ({
                  ...prev,
                  title,
                  slug: slugTouched ? prev.slug : slugify(title),
                }));
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              placeholder="Your article title…"
              className="min-h-[1.2em] w-full resize-none overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] border-0 bg-transparent p-0 text-3xl font-semibold leading-tight tracking-[-0.06em] outline-none placeholder:text-neutral-300 sm:text-5xl"
            />
            <input
              value={data.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", slugify(e.target.value));
              }}
              placeholder="article-url-slug"
              className="w-full border-0 bg-transparent text-xs text-neutral-500 outline-none placeholder:text-neutral-300"
            />
            <textarea
              value={data.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
              placeholder="A short excerpt to introduce the article…"
              rows={2}
              className="w-full resize-y border-0 border-b border-neutral-100 bg-transparent pb-5 text-base leading-7 text-neutral-600 outline-none placeholder:text-neutral-300"
            />
          </div>
          <div className="sticky top-[76px] z-30 flex flex-wrap items-center gap-1 border-y border-neutral-200 bg-[#FAF9F6]/95 p-2 shadow-sm backdrop-blur">
            {tools.map(({ label, icon: Icon, action, active }) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => action()}
                className={`rounded-md p-2 transition-colors hover:bg-white ${active ? "bg-white text-[#F05A28] shadow-sm" : "text-neutral-600"}`}
              >
                <Icon size={17} />
              </button>
            ))}
            <button
              type="button"
              title="Insert a call-to-action button"
              onClick={insertInlineAction}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-xs font-semibold text-neutral-700 hover:border-[#F05A28] hover:bg-orange-50 hover:text-[#C9471B]"
            >
              <MousePointerClick size={15} />
              <span className="hidden md:inline">Button</span>
            </button>
            <span className="mx-1 h-6 w-px bg-neutral-200" />
            <button
              type="button"
              title="Insert image"
              onClick={insertImage}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md p-2 text-sm text-neutral-600 hover:bg-white disabled:opacity-50"
            >
              {uploading ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <ImagePlus size={17} />
              )}
              <span className="hidden sm:inline">Image / GIF</span>
            </button>
            <button
              type="button"
              title="Insert image or GIF by URL"
              onClick={insertImageUrl}
              className="rounded-md p-2 text-neutral-600 hover:bg-white"
            >
              <Link2 size={16} />
            </button>
            <button
              type="button"
              title="Edit selected image or GIF alt text"
              onClick={editSelectedImageAlt}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-xs text-neutral-600 hover:border-[#F05A28] hover:text-[#C9471B]"
            >
              <Type size={15} />
              <span className="hidden md:inline">Alt text</span>
            </button>
            <button
              type="button"
              title="Build a stop-motion animation"
              onClick={openNewAnimationBuilder}
              className="inline-flex items-center gap-2 rounded-md border border-[#F05A28]/30 bg-orange-50 px-2.5 py-2 text-sm font-medium text-[#C9471B] hover:bg-orange-100"
            >
              <Film size={17} />
              <span className="hidden sm:inline">Animation builder</span>
            </button>
            <button
              type="button"
              title="Insert video"
              onClick={insertVideo}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md p-2 text-sm text-neutral-600 hover:bg-white disabled:opacity-50"
            >
              <VideoIcon size={17} />
              <span className="hidden sm:inline">Video</span>
            </button>
            <span className="mx-1 h-6 w-px bg-neutral-200" />
            <button
              type="button"
              title="Undo"
              onClick={() => editor?.chain().focus().undo().run()}
              className="rounded-md p-2 text-neutral-600 hover:bg-white"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => editor?.chain().focus().redo().run()}
              className="rounded-md p-2 text-neutral-600 hover:bg-white"
            >
              <Redo2 size={16} />
            </button>
          </div>
          <>
            {selectedImageActive && (
              <div className="sticky top-[160px] z-20 flex flex-col gap-3 border-b border-orange-200 bg-orange-50/95 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="selected-image-alt"
                    className="block text-xs font-semibold text-neutral-800"
                  >
                    Image / GIF alt text
                  </label>
                  <p className="mt-1 text-[11px] leading-4 text-neutral-600">
                    Describe what the image communicates for readers using
                    screen readers. Leave blank only if the image is purely
                    decorative.
                  </p>
                  <input
                    id="selected-image-alt"
                    value={selectedImageAlt}
                    onChange={(event) =>
                      setSelectedImageAlt(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applySelectedImageAlt();
                      }
                    }}
                    placeholder="Describe the image…"
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#F05A28] focus:ring-2 focus:ring-[#F05A28]/15"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs font-semibold text-neutral-700">
                    Width
                    <select
                      aria-label="Image width"
                      value={String(
                        editor?.getAttributes("image").width || "100%",
                      )}
                      onChange={(event) =>
                        editor
                          ?.chain()
                          .focus()
                          .updateAttributes("image", {
                            width: event.target.value,
                          })
                          .run()
                      }
                      className="ml-2 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs"
                    >
                      <option value="100%">Full</option>
                      <option value="75%">75%</option>
                      <option value="50%">50%</option>
                      <option value="25%">25%</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-neutral-700">
                    Align
                    <select
                      aria-label="Image alignment"
                      value={String(
                        editor?.getAttributes("image").align || "left",
                      )}
                      onChange={(event) =>
                        editor
                          ?.chain()
                          .focus()
                          .updateAttributes("image", {
                            align: event.target.value,
                          })
                          .run()
                      }
                      className="ml-2 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={applySelectedImageAlt}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F05A28] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#d94d20]"
                  >
                    <Check size={14} /> Apply alt text
                  </button>
                </div>
              </div>
            )}
            <EditorContent editor={editor} />
          </>
          <div className="flex items-center justify-between border-t border-neutral-200 bg-[#FAF9F6] px-5 py-3 text-[11px] text-neutral-500">
            <span>
              Rich text · Markdown paste · Drag images here · GIFs · Video ·
              Stop-motion · Inline reader actions
            </span>
            <span>Drop image files into the writing area to insert them</span>
          </div>
        </section>
        {!focusMode && (
          <aside className="space-y-5">
            <details className="rounded-xl border border-neutral-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold">
                Post settings{" "}
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  Category, cover image, visibility
                </span>
              </summary>
              <div className="pt-4">
                <label className="mt-5 block text-xs font-medium text-neutral-600">
                  Category
                  <div className="mt-2">
                    <CustomDropdown
                      ariaLabel="Article category"
                      value={data.category}
                      onChange={(value) => setField("category", value)}
                      options={[
                        {
                          value: "Ideas & observations",
                          label: "Ideas & observations",
                        },
                        {
                          value: "Design & creativity",
                          label: "Design & creativity",
                        },
                        {
                          value: "Architecture & space",
                          label: "Architecture & space",
                        },
                        {
                          value: "Technology & the future",
                          label: "Technology & the future",
                        },
                        { value: "Culture", label: "Culture" },
                        { value: "Personal notes", label: "Personal notes" },
                      ]}
                    />
                  </div>
                </label>
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-medium text-neutral-700">
                      Cover image{" "}
                      <span className="font-normal text-neutral-400">
                        (optional)
                      </span>
                    </label>
                    {data.coverImage && (
                      <button
                        type="button"
                        onClick={() => setField("coverImage", null)}
                        className="text-xs text-neutral-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                    Shown at the top of the published article. Upload a file or
                    paste an image URL.
                  </p>
                  <div className="mt-3 grid grid-cols-2 rounded-lg bg-neutral-100 p-1">
                    <button
                      type="button"
                      onClick={() => setCoverMode("upload")}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${coverMode === "upload" ? "bg-white text-ink shadow-sm" : "text-neutral-500"}`}
                    >
                      Upload image
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${coverMode === "url" ? "bg-white text-ink shadow-sm" : "text-neutral-500"}`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {coverMode === "upload" ? (
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-[#FAF9F6] px-4 py-5 text-center transition-colors hover:border-[#F05A28] hover:bg-orange-50/30">
                      {coverUploading ? (
                        <LoaderCircle
                          size={22}
                          className="animate-spin text-[#F05A28]"
                        />
                      ) : (
                        <Upload size={22} className="text-neutral-500" />
                      )}
                      <span className="mt-2 text-xs font-medium text-neutral-800">
                        {coverUploading
                          ? "Uploading cover…"
                          : "Choose a cover image"}
                      </span>
                      <span className="mt-1 text-[10px] text-neutral-500">
                        JPG, PNG, WebP or GIF · max 10 MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={coverUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadCover(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <div className="mt-3">
                      <label className="text-[11px] text-neutral-500">
                        Image URL
                      </label>
                      <input
                        value={data.coverImage || ""}
                        onChange={(e) =>
                          setField("coverImage", e.target.value || null)
                        }
                        placeholder="https://your-image-url.com/cover.jpg"
                        className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-xs outline-none focus:border-[#F05A28]"
                      />
                    </div>
                  )}
                  {data.coverImage && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                      <img
                        src={data.coverImage}
                        alt="Cover preview"
                        className="max-h-40 w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <span className="truncate text-[10px] text-neutral-500">
                          Cover preview
                        </span>
                        <button
                          type="button"
                          onClick={() => setField("coverImage", null)}
                          className="text-[10px] font-medium text-red-600"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-5 rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium">Visibility</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {data.status === "PUBLISHED"
                      ? "This post is published. Saving as a draft will unpublish it."
                      : "Only you can see this draft until you publish it."}
                  </p>
                </div>
              </div>
            </details>
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <button
                type="button"
                onClick={() => setShowActions((v) => !v)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block font-semibold">Reader actions</span>
                  <span className="mt-1 block text-[11px] leading-5 text-neutral-500">
                    Subscribe, like, or support your work.
                  </span>
                </span>
                <span className="text-xs text-neutral-500">
                  {showActions ? "Hide" : "Edit"}
                </span>
              </button>
              {showActions && (
                <div className="mt-4 space-y-4">
                  <p className="text-[11px] leading-5 text-neutral-500">
                    Add prominent action cards near the article footer. For
                    actions inside the writing, use the “Inline action” button
                    in the editor toolbar. Support buttons open the secure
                    contribution modal.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset, i) => (
                      <button
                        key={`${preset.label}-${i}`}
                        type="button"
                        onClick={() => addAction(preset)}
                        className="flex min-h-10 items-center justify-start gap-2 rounded-lg border border-neutral-200 px-2.5 py-2 text-left text-[11px] font-medium text-neutral-700 hover:border-[#F05A28] hover:bg-orange-50/40"
                      >
                        {preset.kind === "like" ? (
                          <Heart size={14} />
                        ) : preset.kind === "comments" ? (
                          <MessageCircle size={14} />
                        ) : preset.kind === "share" ? (
                          <ExternalLink size={14} />
                        ) : preset.kind === "support" ? (
                          <HandHeart size={14} />
                        ) : (
                          <Coffee size={14} />
                        )}
                        <span>
                          {preset.label.length > 25
                            ? preset.label.slice(0, 23) + "…"
                            : preset.label}
                        </span>
                        <Plus size={12} className="ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                  {data.actionButtons.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-200 px-3 py-5 text-center">
                      <Sparkles
                        size={18}
                        className="mx-auto text-neutral-400"
                      />
                      <p className="mt-2 text-xs font-medium text-neutral-700">
                        No reader actions yet
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        Add a preset or create a custom button.
                      </p>
                    </div>
                  ) : (
                    data.actionButtons.map((action, index) => (
                      <div
                        key={action.id}
                        className="rounded-lg border border-neutral-200 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                            Action {index + 1} · {action.kind}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-[10px] text-neutral-500">
                              <input
                                type="checkbox"
                                checked={action.enabled}
                                onChange={(e) =>
                                  updateAction(
                                    action.id,
                                    "enabled",
                                    e.target.checked,
                                  )
                                }
                              />{" "}
                              Show
                            </label>
                            <button
                              type="button"
                              title="Remove action"
                              onClick={() => removeAction(action.id)}
                              className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <label className="mt-3 block text-[11px] font-medium text-neutral-600">
                          Button text
                        </label>
                        <input
                          value={action.label}
                          onChange={(e) =>
                            updateAction(action.id, "label", e.target.value)
                          }
                          placeholder="e.g. Get me a shawarma"
                          className="mt-1 w-full rounded-md border border-neutral-200 px-2.5 py-2 text-xs outline-none focus:border-[#F05A28]"
                        />
                        <label className="mt-3 block text-[11px] font-medium text-neutral-600">
                          Supporting text{" "}
                          <span className="font-normal text-neutral-400">
                            (optional)
                          </span>
                        </label>
                        <input
                          value={action.description}
                          onChange={(e) =>
                            updateAction(
                              action.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="A short note to readers"
                          className="mt-1 w-full rounded-md border border-neutral-200 px-2.5 py-2 text-xs outline-none focus:border-[#F05A28]"
                        />
                        {["subscribe", "custom"].includes(action.kind) && (
                          <>
                            <label className="mt-3 block text-[11px] font-medium text-neutral-600">
                              Destination URL{" "}
                              <span className="font-normal text-neutral-400">
                                (required for external links)
                              </span>
                            </label>
                            <input
                              value={action.url}
                              onChange={(e) =>
                                updateAction(action.id, "url", e.target.value)
                              }
                              placeholder="https://…"
                              className="mt-1 w-full rounded-md border border-neutral-200 px-2.5 py-2 text-xs outline-none focus:border-[#F05A28]"
                            />{" "}
                          </>
                        )}
                        {action.kind === "support" && (
                          <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                            This opens a simplified contribution modal with one
                            suggested amount, an optional custom amount, and
                            secure Paystack checkout. Keep your secret key in
                            the server environment only.
                          </p>
                        )}
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => addAction()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-xs font-medium text-neutral-600 hover:border-[#F05A28] hover:text-[#F05A28]"
                  >
                    <Plus size={14} /> Create custom button
                  </button>
                </div>
              )}
            </section>
            <details className="rounded-xl border border-neutral-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold">
                Publishing checklist
              </summary>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-neutral-600">
                <li>• Give the article a clear title.</li>
                <li>• Add a short, useful excerpt.</li>
                <li>• Check headings and image alt text.</li>
                <li>• Read through once before publishing.</li>
              </ul>
              <p className="mt-4 text-[11px] leading-5 text-neutral-400">
                Image, GIF, video, and animation frame uploads require
                Cloudinary to be configured. Videos are limited to 50 MB; each
                image frame is limited to 10 MB.
              </p>
            </details>
          </aside>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          {notice}
        </p>
      )}
      {inlineActionModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inline-action-title"
        >
          <section className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h2
                  id="inline-action-title"
                  className="text-lg font-semibold tracking-tight text-neutral-900"
                >
                  Insert a button
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Add a clear call to action at your cursor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInlineActionModalOpen(false)}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close button settings"
              >
                <X size={17} />
              </button>
            </header>
            <div className="space-y-4 p-5">
              <label className="block text-xs font-semibold text-neutral-700">
                Button action
                <div className="mt-1.5">
                  <CustomDropdown
                    ariaLabel="Button action"
                    value={inlineActionKind}
                    onChange={(value) =>
                      changeInlineActionKind(
                        value as
                          | "support"
                          | "like"
                          | "comments"
                          | "share"
                          | "custom",
                      )
                    }
                    options={[
                      { value: "support", label: "Support this work" },
                      { value: "like", label: "Like this article" },
                      { value: "comments", label: "Open comments" },
                      { value: "share", label: "Share this article" },
                      { value: "custom", label: "Open a custom link" },
                    ]}
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-neutral-700">
                Button text
                <input
                  autoFocus
                  value={inlineActionLabel}
                  onChange={(e) => setInlineActionLabel(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Buy me a coffee"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#F05A28]"
                />
              </label>
              {inlineActionKind === "custom" && (
                <label className="block text-xs font-semibold text-neutral-700">
                  Destination URL
                  <input
                    value={inlineActionUrl}
                    onChange={(e) => setInlineActionUrl(e.target.value)}
                    placeholder="https://example.com"
                    inputMode="url"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#F05A28]"
                  />
                </label>
              )}
              <div className="rounded-xl border border-dashed border-neutral-200 bg-[#FAF9F6] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Preview
                </p>
                <div className="flex justify-center">
                  <span className="inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-[#F05A28] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
                    {inlineActionLabel.trim() || "Button text"}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </div>
            <footer className="flex justify-end gap-2 border-t border-neutral-100 bg-[#FAF9F6] px-5 py-4">
              <button
                type="button"
                onClick={() => setInlineActionModalOpen(false)}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitInlineAction}
                disabled={
                  !inlineActionLabel.trim() ||
                  (inlineActionKind === "custom" &&
                    !/^https?:\/\//i.test(inlineActionUrl.trim()))
                }
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#F05A28] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Insert button <MousePointerClick size={15} />
              </button>
            </footer>
          </section>
        </div>
      )}
      {animationBuilderOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-neutral-950/60 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="animation-builder-title"
        >
          <section className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F05A28]">
                  Article media tool
                </p>
                <h2
                  id="animation-builder-title"
                  className="mt-1 text-xl font-semibold tracking-tight text-neutral-900"
                >
                  {editingAnimationPosition !== null
                    ? "Edit animation"
                    : "Animation builder"}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
                  {editingAnimationPosition !== null
                    ? "Update the frames, order, speed, loop, or accessibility description. Your changes will replace this animation in the article."
                    : "Arrange your frames on the timeline, scrub to any moment, and preview the loop before inserting it into your article."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnimationBuilderOpen(false);
                  setEditingAnimationPosition(null);
                }}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close animation builder"
              >
                <X size={18} />
              </button>
            </header>
            <div className="space-y-5 p-4 sm:p-6">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)]">
                <div className="min-w-0">
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-[#FAF9F6]">
                    <div className="relative flex aspect-video items-center justify-center bg-neutral-100">
                      {animationFrames.length > 0 ? (
                        <>
                          {" "}
                          <img
                            src={
                              animationFrames[
                                Math.min(
                                  animationPreviousIndex,
                                  animationFrames.length - 1,
                                )
                              ]?.url || animationFrames[0].url
                            }
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-contain"
                          />
                          <img
                            key={`${animationPreviewIndex}-${animationFrames[Math.min(animationPreviewIndex, animationFrames.length - 1)]?.url}`}
                            src={
                              animationFrames[
                                Math.min(
                                  animationPreviewIndex,
                                  animationFrames.length - 1,
                                )
                              ]?.url || animationFrames[0].url
                            }
                            alt={animationAlt || "Stop-motion preview"}
                            className="animation-preview-current h-full w-full object-contain"
                            style={{
                              animationDuration: `${Math.min(90, Math.round(800 / animationFps))}ms`,
                            }}
                          />
                        </>
                      ) : (
                        <div className="px-6 text-center">
                          <Film
                            size={30}
                            className="mx-auto text-neutral-400"
                          />
                          <p className="mt-3 text-sm font-medium text-neutral-700">
                            Your animation preview
                          </p>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Upload at least two frames to play the sequence.
                          </p>
                        </div>
                      )}
                      {animationFrames.length > 0 && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-neutral-950/75 px-2.5 py-1 text-[11px] text-white">
                          Frame{" "}
                          {Math.min(
                            animationPreviewIndex + 1,
                            animationFrames.length,
                          )}{" "}
                          / {animationFrames.length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAnimationPlaying((v) => !v)}
                          disabled={animationFrames.length < 2}
                          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#F05A28] disabled:opacity-40"
                        >
                          {animationPlaying ? (
                            <Pause size={13} />
                          ) : (
                            <Play size={13} />
                          )}{" "}
                          {animationPlaying ? "Pause" : "Play"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnimationPreviousIndex(animationPreviewIndex);
                            setAnimationPreviewIndex(0);
                            setAnimationPlaying(true);
                          }}
                          disabled={animationFrames.length < 1}
                          className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 hover:border-neutral-400 disabled:opacity-40"
                          title="Restart preview"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                      <div className="min-w-[140px] flex-1">
                        <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-500">
                          <span>Timeline scrubber</span>
                          <span>
                            {animationFrames.length
                              ? `${(animationPreviewIndex / animationFps).toFixed(2)}s / ${(animationFrames.length / animationFps).toFixed(2)}s`
                              : "0.00s / 0.00s"}
                          </span>
                        </div>
                        <input
                          aria-label="Scrub animation timeline"
                          type="range"
                          min={0}
                          max={Math.max(0, animationFrames.length - 1)}
                          step={1}
                          value={Math.min(
                            animationPreviewIndex,
                            Math.max(0, animationFrames.length - 1),
                          )}
                          onChange={(e) => {
                            setAnimationPreviousIndex(animationPreviewIndex);
                            setAnimationPreviewIndex(Number(e.target.value));
                            setAnimationPlaying(false);
                          }}
                          disabled={animationFrames.length < 1}
                          className="w-full accent-[#F05A28] disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block min-w-0 text-xs font-semibold text-neutral-700">
                      Frame rate
                      <div className="mt-1.5">
                        <CustomDropdown
                          ariaLabel="Animation frame rate"
                          value={String(animationFps)}
                          onChange={(value) => setAnimationFps(Number(value))}
                          options={[
                            { value: "2", label: "2 fps · slow" },
                            { value: "4", label: "4 fps" },
                            { value: "6", label: "6 fps" },
                            { value: "8", label: "8 fps" },
                            { value: "10", label: "10 fps" },
                            { value: "12", label: "12 fps" },
                            { value: "16", label: "16 fps" },
                            { value: "24", label: "24 fps · fast" },
                          ]}
                        />
                      </div>
                    </label>
                    <label className="block min-w-0 text-xs font-semibold text-neutral-700">
                      Playback
                      <div className="mt-1.5">
                        <CustomDropdown
                          ariaLabel="Animation playback mode"
                          value={animationLoop ? "loop" : "once"}
                          onChange={(value) =>
                            setAnimationLoop(value === "loop")
                          }
                          options={[
                            { value: "loop", label: "Loop continuously" },
                            { value: "once", label: "Play once" },
                          ]}
                        />
                      </div>
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Accessibility description{" "}
                    <span className="font-normal text-neutral-400">
                      (alt text)
                    </span>
                    <input
                      value={animationAlt}
                      onChange={(e) => setAnimationAlt(e.target.value)}
                      placeholder="Describe what changes across the frames"
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#F05A28]"
                    />
                  </label>
                  <div className="rounded-xl bg-[#FAF9F6] p-4">
                    <div className="flex items-start gap-3">
                      <Clock3 size={17} className="mt-0.5 text-neutral-500" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">
                          Sequence summary
                        </p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {animationFrames.length} frames ·{" "}
                          {(animationFrames.length / animationFps).toFixed(2)}{" "}
                          seconds ·{" "}
                          {animationLoop
                            ? "Repeats continuously"
                            : "Plays once"}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                          Each frame stays on screen for about{" "}
                          {(1000 / animationFps).toFixed(0)} ms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <section className="min-w-0 rounded-xl border border-neutral-200">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Timeline{" "}
                      <span className="font-normal text-neutral-400">
                        ({animationFrames.length} frames)
                      </span>
                    </h3>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Drag frames left or right, or set the selected frame’s
                      order directly.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {animationFrames.length > 0 && (
                      <>
                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                          Selected frame order
                          <input
                            aria-label="Selected frame order"
                            type="number"
                            min={1}
                            max={animationFrames.length}
                            step={1}
                            value={Math.min(
                              animationPreviewIndex + 1,
                              animationFrames.length,
                            )}
                            onChange={(event) => {
                              const position = Number(event.target.value);
                              if (
                                Number.isInteger(position) &&
                                position >= 1 &&
                                position <= animationFrames.length
                              )
                                reorderAnimationFrames(
                                  animationPreviewIndex,
                                  position - 1,
                                );
                            }}
                            className="w-[68px] rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm font-semibold text-neutral-900 outline-none focus:border-[#F05A28] focus:ring-2 focus:ring-orange-100"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            removeAnimationFrame(animationPreviewIndex)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50"
                          title={`Delete selected frame ${animationPreviewIndex + 1}`}
                        >
                          <Trash2 size={13} />
                          Delete selected
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={chooseAnimationFrames}
                      disabled={animationUploading}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#F05A28] disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {animationUploading ? "Uploading…" : "Add frames"}
                    </button>
                  </div>
                </header>
                {animationUploading && (
                  <div className="flex items-center gap-2 border-b border-orange-100 bg-orange-50 px-4 py-2.5 text-xs text-[#9A3412]">
                    <LoaderCircle size={14} className="animate-spin" />
                    Uploading frames to your media library…
                  </div>
                )}
                <div className="overflow-x-auto p-3">
                  <div className="flex min-h-[116px] min-w-max items-stretch gap-2">
                    {animationFrames.map((frame, index) => (
                      <div
                        key={`${frame.url}-${index}`}
                        draggable
                        onDragStart={(event) =>
                          handleFrameDragStart(event, index)
                        }
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          setDragOverAnimationFrame(index);
                        }}
                        onDrop={(event) => handleFrameDrop(event, index)}
                        onDragEnd={() => {
                          setDraggingAnimationFrame(null);
                          setDragOverAnimationFrame(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.altKey && event.key === "ArrowLeft") {
                            event.preventDefault();
                            reorderAnimationFrames(index, index - 1);
                          }
                          if (event.altKey && event.key === "ArrowRight") {
                            event.preventDefault();
                            reorderAnimationFrames(index, index + 1);
                          }
                        }}
                        tabIndex={0}
                        aria-label={`Frame ${index + 1}, drag to reorder. Alt plus left or right arrow also reorders.`}
                        className={`group relative w-[112px] shrink-0 cursor-grab overflow-hidden rounded-lg border bg-white text-left transition ${index === animationPreviewIndex ? "border-[#F05A28] ring-2 ring-orange-100" : "border-neutral-200 hover:border-neutral-400"} ${dragOverAnimationFrame === index && draggingAnimationFrame !== index ? "border-l-4 border-l-[#F05A28]" : ""} ${draggingAnimationFrame === index ? "opacity-40" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAnimationPreviousIndex(animationPreviewIndex);
                            setAnimationPreviewIndex(index);
                            setAnimationPlaying(false);
                          }}
                          className="block w-full text-left"
                          aria-label={`Preview frame ${index + 1}`}
                        >
                          <div className="relative h-[74px] bg-neutral-100">
                            <img
                              src={frame.url}
                              alt=""
                              draggable={false}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute left-1.5 top-1.5 rounded bg-neutral-950/75 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="px-2 py-1.5">
                            <p
                              className="truncate text-[10px] font-medium text-neutral-700"
                              title={frame.name}
                            >
                              {frame.name || `Frame ${index + 1}`}
                            </p>
                            <p className="text-[9px] text-neutral-400">
                              {(index / animationFps).toFixed(2)}s
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center justify-between gap-1 border-t border-neutral-100 px-2 py-1.5">
                          <span className="flex items-center gap-1 text-[9px] text-neutral-400">
                            <GripVertical size={11} /> Drag
                          </span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              removeAnimationFrame(index);
                            }}
                            draggable={false}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                            aria-label={`Delete frame ${index + 1}`}
                            title={`Delete frame ${index + 1}`}
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {animationFrames.length === 0 && (
                      <button
                        type="button"
                        onClick={chooseAnimationFrames}
                        className="flex min-h-[112px] w-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-[#FAF9F6] px-4 text-center hover:border-[#F05A28]"
                      >
                        <ImagePlus size={22} className="text-neutral-400" />
                        <span className="mt-2 text-xs font-medium text-neutral-700">
                          Upload image frames
                        </span>
                        <span className="mt-1 text-[10px] text-neutral-500">
                          Select multiple JPG, PNG, or WebP files.
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-neutral-100 bg-[#FAF9F6] px-4 py-2.5 text-[10px] text-neutral-500">
                  <span>
                    Select a frame, then use Delete selected or the Delete
                    button on its card · Drag to reorder
                  </span>
                  <span>Keep frames under 10 MB each</span>
                </div>
              </section>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 bg-[#FAF9F6] px-5 py-4 sm:px-7">
              <p className="text-xs text-neutral-500">
                {animationFrames.length < 2
                  ? "At least 2 frames are needed."
                  : `${animationFrames.length} frames · ${(animationFrames.length / animationFps).toFixed(2)} seconds ready to insert.`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnimationBuilderOpen(false);
                    setEditingAnimationPosition(null);
                  }}
                  className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertStopMotion}
                  disabled={animationFrames.length < 2 || animationUploading}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F05A28] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d84b1e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Film size={15} />
                  {editingAnimationPosition !== null
                    ? "Save animation changes"
                    : "Insert animation"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
