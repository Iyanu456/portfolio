"use client";
import { ArrowUpRight, Heart, Coffee, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { openSupportModal } from "@/components/support-payment-modal";

type Action = { id: string; kind: string; label: string; description: string; url: string };
function openInteraction(mode: "like" | "comments" | "share") { window.dispatchEvent(new CustomEvent("iyanu:open-interaction", { detail: { mode } })); }
export default function ArticleActionButtons({ actions }: { actions: Action[] }) {
  if (!actions.length) return null;
  return <div className="mt-8 grid gap-3 sm:grid-cols-2">{actions.map((action, index) => {
    const support = action.kind === "support";
    const interaction = ["like", "comments", "share"].includes(action.kind);
    const Icon = support ? Coffee : action.kind === "like" ? Heart : action.kind === "comments" ? MessageCircle : action.kind === "share" ? Share2 : ExternalLink;
    const classes = support ? "border-[#F05A28]/35 bg-orange-50/80 hover:border-[#F05A28] hover:bg-orange-50" : "border-line bg-white/80 hover:border-neutral-400";
    const content = <><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#F05A28] shadow-sm"><Icon size={17}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{action.label}</span>{action.description && <span className="mt-1 block text-xs leading-5 text-neutral-600">{action.description}</span>}</span><ArrowUpRight size={16} className="shrink-0 text-neutral-400"/></>;
    return support ? <button key={action.id || index} type="button" onClick={openSupportModal} className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${classes}`}>{content}</button> : interaction ? <button key={action.id || index} type="button" onClick={() => openInteraction(action.kind as "like" | "comments" | "share")} className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${classes}`}>{content}</button> : <a key={action.id || index} href={action.url} target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${classes}`}>{content}</a>;
  })}</div>;
}
