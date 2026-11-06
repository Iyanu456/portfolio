import { getCollection } from "@/lib/mongodb";
import type { Document } from "mongodb";

const siteName = "Iyanu Oyerinde";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
const senderEmail = process.env.BREVO_SENDER_EMAIL || "";
const senderName = process.env.BREVO_SENDER_NAME || siteName;

type EmailAddress = { email: string; name?: string };
export async function sendEmail(to: EmailAddress | EmailAddress[], subject: string, htmlContent: string, textContent?: string, options?: { replyTo?: EmailAddress }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !senderEmail) {
    console.warn(`[email] Skipped "${subject}": BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured.`);
    return { sent: false, reason: "not_configured" as const };
  }
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
      headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { email: senderEmail, name: senderName }, to: Array.isArray(to) ? to : [to], subject, htmlContent, ...(textContent ? { textContent } : {}), ...(options?.replyTo ? { replyTo: options.replyTo } : {}) })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[email] Brevo returned ${response.status}: ${detail.slice(0, 400)}`);
      return { sent: false, reason: "provider_error" as const };
    }
    return { sent: true as const };
  } catch (error) {
    console.error("[email] Could not send email:", error);
    return { sent: false, reason: "network_error" as const };
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}
function emailShell(content: string) {
  return `<div style="font-family:Arial,sans-serif;background:#faf9f6;padding:28px 12px;color:#222"><div style="max-width:600px;margin:auto;background:#fff;padding:32px;border:1px solid #e9e5df;border-radius:12px"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f05a28">${siteName}</p>${content}<p style="font-size:12px;line-height:1.6;color:#888;border-top:1px solid #eee;padding-top:18px;margin-top:28px">A place for ideas to take shape. <a href="${siteUrl}/shelf" style="color:#f05a28">Visit the publication</a></p></div></div>`;
}
export async function notifyOwner(subject: string, htmlContent: string, textContent?: string) {
  const owner = process.env.SITE_OWNER_EMAIL;
  if (!owner) { console.warn("[email] SITE_OWNER_EMAIL is not configured; owner notification skipped."); return { sent: false as const, reason: "not_configured" as const }; }
  return sendEmail({ email: owner, name: siteName }, subject, htmlContent, textContent);
}

export type SubscriberRecord = Document & { email: string; name: string; normalizedEmail: string; interests?: string[]; status: "ACTIVE" | "UNSUBSCRIBED"; unsubscribeToken: string; createdAt: Date; updatedAt: Date; subscribedAt?: Date };
export async function getSubscribers() {
  const subscribers = await getCollection<SubscriberRecord>("subscribers");
  await subscribers.createIndex({ normalizedEmail: 1 }, { unique: true });
  await subscribers.createIndex({ status: 1, subscribedAt: -1 });
  await subscribers.createIndex({ unsubscribeToken: 1 }, { unique: true, sparse: true });
  return subscribers;
}
export async function sendWelcomeEmail(subscriber: Pick<SubscriberRecord, "email" | "name" | "unsubscribeToken">) {
  const unsubscribe = `${siteUrl}/api/subscriptions/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
  const html = emailShell(`<h1 style="font-size:28px;line-height:1.2">You're on the list.</h1><p style="font-size:15px;line-height:1.8;color:#555">Hi ${escapeHtml(subscriber.name || "there")}, thanks for subscribing. When a new piece is published, it will find its way to your inbox — thoughtful notes, ideas, and the occasional rabbit hole.</p><p><a href="${siteUrl}/shelf" style="display:inline-block;background:#22231f;color:#fff;padding:12px 18px;border-radius:24px;text-decoration:none">Explore the shelf</a></p><p style="font-size:11px;color:#888">If you ever want to leave the list, <a href="${unsubscribe}">unsubscribe here</a>.</p>`);
  return sendEmail({ email: subscriber.email, name: subscriber.name || undefined }, "You're subscribed — Iyanu Oyerinde", html, `Hi ${subscriber.name || "there"}, thanks for subscribing. New writing will arrive in your inbox. Unsubscribe: ${unsubscribe}`);
}
function createArticlePreview(contentHtml: string, fallbackExcerpt: string, maxLength = 720) {
  // Email previews should contain readable article text, never editor/media controls.
  const plainText = String(contentHtml || "")
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote|\/div)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
  const source = plainText || String(fallbackExcerpt || "").trim() || "A new piece is ready to read.";
  if (source.length <= maxLength) return { text: source, truncated: false };
  const boundary = source.lastIndexOf(" ", maxLength);
  return { text: source.slice(0, boundary > maxLength * 0.7 ? boundary : maxLength).trim(), truncated: true };
}

export async function sendNewPostToSubscribers(post: { title: string; excerpt: string; slug: string; category?: string; contentHtml?: string }) {
  const subscribers = await getSubscribers();
  const allActive = await subscribers.find({ status: "ACTIVE" }, { projection: { email: 1, name: 1, unsubscribeToken: 1, interests: 1 } }).toArray();
  // Legacy subscribers without preferences continue receiving all topics.
  const active = allActive.filter((subscriber) => !Array.isArray(subscriber.interests) || subscriber.interests.length === 0 || subscriber.interests.includes(post.category || ""));
  if (!process.env.BREVO_API_KEY || !senderEmail) {
    console.warn(`[email] Skipped subscriber broadcast for "${post.title}": Brevo sender settings are not configured.`);
    return { total: active.length, sent: 0, configured: false };
  }
  const articleUrl = `${siteUrl}/shelf/${encodeURIComponent(post.slug)}`;
  const preview = createArticlePreview(post.contentHtml || "", post.excerpt);
  let sent = 0;
  for (let index = 0; index < active.length; index += 20) {
    const batch = active.slice(index, index + 20);
    const results = await Promise.all(batch.map((subscriber) => {
      const unsubscribe = `${siteUrl}/api/subscriptions/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
      const previewNote = preview.truncated ? `<p style="font-size:13px;color:#888;margin-top:18px">Continue reading the full essay on the site.</p>` : "";
      const html = emailShell(`<p style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#f05a28">New writing</p><h1 style="font-size:30px;line-height:1.2;margin-bottom:22px">${escapeHtml(post.title)}</h1><div style="font-size:16px;line-height:1.9;color:#444;white-space:normal"><p>${escapeHtml(preview.text)}</p></div>${previewNote}<p style="margin:26px 0"><a href="${articleUrl}" style="display:inline-block;background:#22231f;color:#fff;padding:13px 20px;border-radius:24px;text-decoration:none">Continue reading</a></p><p style="font-size:11px;color:#888">You're receiving this because you subscribed to the publication. <a href="${unsubscribe}">Unsubscribe</a>.</p>`);
      const textPreview = `${preview.text}${preview.truncated ? "\n\nContinue reading the full essay:" : ""}`;
      return sendEmail({ email: subscriber.email, name: subscriber.name || undefined }, post.title, html, `${post.title}\n\n${textPreview}\n${articleUrl}\n\nUnsubscribe: ${unsubscribe}`);
    }));
    sent += results.filter((result) => result.sent).length;
  }
  return { total: active.length, sent, configured: true };
}
export { escapeHtml, emailShell, siteUrl };
