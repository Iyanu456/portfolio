"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, Heart, MessageCircle, Share2, X, ExternalLink } from "lucide-react";
import { trackAnalytics } from "@/lib/client-analytics";

type CommentItem = { name: string; body: string; createdAt: string };
type LikeAvatar = { initials: string; color: string };
type ModalMode = "like" | "comments" | "share" | null;

export default function PostInteractions({ slug, title, excerpt }: { slug: string; title: string; excerpt?: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [likeAvatars, setLikeAvatars] = useState<LikeAvatar[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState("");
  const [likeName, setLikeName] = useState("");
  const [email, setEmail] = useState("");
  const [likeEmail, setLikeEmail] = useState("");
  const [comment, setComment] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  async function refresh() {
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/interactions`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setLikeCount(Number(data.likeCount || 0));
        setLikeAvatars(Array.isArray(data.likeAvatars) ? data.likeAvatars : []);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      }
    } catch { /* Keep the article readable if interactions are unavailable. */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const handleInlineAction = (event: Event) => {
      const custom = event as CustomEvent<{ mode?: ModalMode }>;
      if (custom.detail?.mode) { setModal(custom.detail.mode); setError(""); setNotice(""); }
    };
    window.addEventListener("iyanu:open-interaction", handleInlineAction);
    return () => window.removeEventListener("iyanu:open-interaction", handleInlineAction);
  }, []);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    try {
      const saved = window.localStorage.getItem("iyanu-publication-reader");
      if (saved) {
        const reader = JSON.parse(saved) as { name?: string; email?: string };
        if (reader.name) { setLikeName(reader.name); setName(reader.name); }
        if (reader.email) { setLikeEmail(reader.email); setEmail(reader.email); }
      }
    } catch { /* Storage may be unavailable; manual entry still works. */ }
    void refresh();
  }, [slug]);

  function rememberReader(readerName: string, readerEmail: string) {
    try { window.localStorage.setItem("iyanu-publication-reader", JSON.stringify({ name: readerName.trim(), email: readerEmail.trim().toLowerCase() })); }
    catch { /* Interaction still succeeds without local storage. */ }
  }

  async function submitLike(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/interactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "like", name: likeName, email: likeEmail }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your like.");
      rememberReader(likeName, likeEmail); setNotice(data.message || "Thanks for the like!"); setModal(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save your like."); }
    finally { setBusy(false); }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/interactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", name, email, comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit your comment.");
      if (data.comment) setComments((current) => [data.comment, ...current]);
      rememberReader(name, email); setComment(""); setNotice("Your comment has been added. Thanks for joining the conversation.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your comment."); }
    finally { setBusy(false); }
  }

  function trackShare(platform: string) {
    trackAnalytics({ type: "click", path: window.location.pathname, slug, target: `share:${platform}`, label: `Share: ${platform}` });
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(currentUrl || window.location.href); trackShare("copy_link"); setCopied(true); setNotice("Link copied to clipboard."); window.setTimeout(() => setCopied(false), 1800); }
    catch { setError("Your browser could not copy the link. You can copy it from the address bar."); }
  }

  const shareUrl = encodeURIComponent(currentUrl);
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(excerpt ? `${title} — ${excerpt}` : title);
  const shareItems = [
    { label: "WhatsApp", href: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];
  const fieldClass = "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#F05A28]";

  return (
    <section className="mx-auto mt-12 max-w-[760px] border-t border-line pt-6" aria-label="Article interactions">
      {likeCount > 0 && <div className="mb-5 flex items-center gap-3" aria-label={`${likeCount} people liked this article`}>
        <div className="flex -space-x-2">{likeAvatars.map((avatar, index) => <span key={`${avatar.initials}-${index}`} title="Reader" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-neutral-800 shadow-sm" style={{ backgroundColor: avatar.color }}>{avatar.initials}</span>)}</div>
        <span className="text-xs text-neutral-500">{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
      </div>}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-neutral-700">Keep the conversation going</p>
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" aria-label="Like this article" title="Like" onClick={() => { setModal("like"); setError(""); setNotice(""); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-[#F05A28]/50 hover:bg-orange-50 hover:text-[#C9471B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05A28]"><Heart size={18}/><span>{loading ? "…" : likeCount}</span></button>
          <button type="button" aria-label="Read or add comments" title="Comments" onClick={() => { setModal("comments"); setError(""); setNotice(""); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-[#F05A28]/50 hover:bg-orange-50 hover:text-[#C9471B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05A28]"><MessageCircle size={18}/><span>{comments.length}</span></button>
          <button type="button" aria-label="Share this article" title="Share" onClick={() => { setModal("share"); setError(""); setNotice(""); }} className="inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-200 bg-white p-3 text-neutral-700 transition-colors hover:border-[#F05A28]/50 hover:bg-orange-50 hover:text-[#C9471B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05A28]"><Share2 size={18}/></button>
        </div>
      </div>

      {modal && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby={`interaction-modal-title-${slug}`} className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id={`interaction-modal-title-${slug}`} className="text-xl font-semibold tracking-tight">{modal === "like" ? "Leave a like" : modal === "comments" ? "The conversation" : "Share this article"}</h2><p className="mt-1 text-sm leading-6 text-neutral-500">{modal === "like" ? "Your email helps us count one like per reader on this post." : modal === "comments" ? "Add a thought, or read what others have shared." : "Send this piece to someone who might enjoy it."}</p></div><button type="button" aria-label="Close dialog" onClick={() => setModal(null)} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"><X size={19}/></button></div>

          {modal === "like" && <form onSubmit={submitLike} className="space-y-3"><div><label htmlFor={`like-name-${slug}`} className="block text-sm font-medium">Your name</label><input id={`like-name-${slug}`} value={likeName} onChange={(e) => setLikeName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name" placeholder="Your name" className={fieldClass}/></div><div><label htmlFor={`like-email-${slug}`} className="block text-sm font-medium">Your email</label><input id={`like-email-${slug}`} type="email" value={likeEmail} onChange={(e) => setLikeEmail(e.target.value)} maxLength={254} required autoComplete="email" placeholder="you@example.com" className={fieldClass}/></div><p className="text-xs leading-5 text-neutral-500">Your email stays private. We’ll remember your details on this device for next time.</p><button disabled={busy} className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#F05A28] disabled:opacity-50">{busy ? "Saving…" : "Leave a like"}</button></form>}

          {modal === "comments" && <><form onSubmit={submitComment} className="space-y-3"><div><label htmlFor={`comment-name-${slug}`} className="block text-sm font-medium">Name</label><input id={`comment-name-${slug}`} value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name" className={fieldClass} placeholder="Your name"/></div><div><label htmlFor={`comment-email-${slug}`} className="block text-sm font-medium">Email</label><input id={`comment-email-${slug}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required autoComplete="email" className={fieldClass} placeholder="you@example.com"/><p className="mt-1 text-xs text-neutral-400">Your email will not appear with your comment.</p></div><div><label htmlFor={`comment-body-${slug}`} className="block text-sm font-medium">Your comment</label><textarea id={`comment-body-${slug}`} value={comment} onChange={(e) => setComment(e.target.value)} minLength={2} maxLength={3000} required rows={3} className={`${fieldClass} resize-y leading-6`} placeholder="Add to the conversation…"/></div><button disabled={busy} className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#F05A28] disabled:opacity-50">{busy ? "Submitting…" : "Post comment"}</button></form><div className="mt-6 border-t border-line pt-4"><h3 className="text-sm font-semibold">Comments ({comments.length})</h3><div className="mt-3 max-h-64 divide-y divide-line overflow-y-auto">{comments.map((item, index) => <article key={`${item.createdAt}-${index}`} className="py-4 first:pt-0"><div className="flex items-baseline justify-between gap-3"><h4 className="text-sm font-semibold">{item.name}</h4><time className="shrink-0 text-xs text-neutral-400" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">{item.body}</p></article>)}{!loading && comments.length === 0 && <p className="py-4 text-sm text-neutral-500">No comments yet. You can start the conversation.</p>}</div></div></>}

          {modal === "share" && <div className="space-y-2">{typeof window !== "undefined" && <button type="button" onClick={async () => { if (navigator.share) { try { await navigator.share({ title, text: excerpt || title, url: currentUrl || window.location.href }); trackShare("native_share"); setModal(null); } catch { /* Reader cancelled the share sheet. */ } } else { await copyLink(); } }} className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-sm font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-50"><span>More sharing options</span><ExternalLink size={16}/></button>}{shareItems.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => { trackShare(item.label.toLowerCase()); setModal(null); }} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"><span>{item.label}</span><ExternalLink size={15} className="text-neutral-400"/></a>)}<button type="button" onClick={copyLink} className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"><span>{copied ? "Link copied" : "Copy article link"}</span>{copied ? <Check size={16}/> : <Copy size={16}/>}</button></div>}

          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        </section>
      </div>}
    </section>
  );
}
