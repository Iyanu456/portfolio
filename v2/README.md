# Iyanu Oyerinde — Personal Publication + Mini CMS

A personal editorial website and private admin CMS built with Next.js App Router, TypeScript, Tailwind CSS, Tiptap, MongoDB, and Cloudinary media uploads.

## Requirements

- Node.js 20.9+
- pnpm 9+ (the included `pnpm-lock.yaml` is the canonical lockfile)
- MongoDB Atlas (or another MongoDB deployment)
- Cloudinary account for persistent image, GIF, and video uploads

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI`, `MONGODB_DB`, `ADMIN_PASSWORD`, and a long random `AUTH_SECRET`.
3. Add Cloudinary credentials to enable media uploads.
4. Install dependencies and start the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Visit http://localhost:3000. Admin login is at `/admin/login`.

The app creates useful MongoDB indexes on the first database-backed request. Ensure the database user has permission to create indexes, or create them manually in the `posts` collection.

## Admin CMS

- Password-protected admin session (HTTP-only cookie)
- Dashboard listing posts and draft/published status
- Create, edit, publish, unpublish (save as draft), and delete posts
- Rich text editor: bold, italic, underline, headings, lists, left/center/right text alignment, links, blockquotes, horizontal rules, images/GIFs with editable alt text, and video blocks
- Upload images and GIFs (max 10 MB) or videos (max 50 MB) to Cloudinary directly from the editor
- Post metadata: title, slug, excerpt, category, optional cover-image URL
- Post content saved as HTML in MongoDB

## Environment variables

- `MONGODB_URI`: private MongoDB connection string
- `MONGODB_DB`: database name (defaults to `iyanu_publication`)
- `ADMIN_PASSWORD`: strong, unique admin password
- `AUTH_SECRET`: random secret of at least 32 characters
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: media uploads
- `BREVO_API_KEY`: Brevo transactional email API key (server-side only)
- `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`: verified sender identity in Brevo
- `SITE_OWNER_EMAIL`: inbox for comment, like, subscription, and contribution notifications
- `NEXT_PUBLIC_CONTACT_EMAIL`: optional public contact email override; defaults to `oyerindei13@gmail.com`

Never commit `.env.local` or expose your MongoDB or Cloudinary credentials. Use environment variables in your hosting provider for production.

## Before public launch

- Set `NEXT_PUBLIC_SITE_URL` to your real canonical domain (for example `https://yourdomain.com`) in `.env.local` and your hosting provider. Article canonical URLs, Open Graph metadata, Twitter cards, and structured data use this value.
- Set `NEXT_PUBLIC_CONTACT_EMAIL` to your public contact email. If omitted or blank, the site uses the configured public contact address `oyerindei13@gmail.com`.
- Configure the environment variables locally and in your hosting provider.
- Confirm your MongoDB Atlas network access and database-user permissions allow the deployed app to connect.
- For email subscriptions and new-post broadcasts, configure `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (a verified sender in Brevo), `BREVO_SENDER_NAME`, `SITE_OWNER_EMAIL`, and `NEXT_PUBLIC_SITE_URL`. The API stores subscriptions in MongoDB even if a welcome email cannot be sent; the form reports that difference.
- Test the subscription form with a real inbox, confirm the welcome email and unsubscribe link, then publish a test post with “Email this post to all active subscribers” enabled. The CMS reports the number of successful sends; check Brevo logs for provider-level delivery/bounce status.
- Test admin login, post CRUD, image/GIF uploads, video uploads, and public rendering.
- Run `pnpm build` before deploying.

## Media notes

GIFs are uploaded as images and inserted using the image block. Uploaded videos are stored by Cloudinary as video assets and inserted as native HTML video players with controls. Upload size limits are enforced by the API. Large videos may need a higher plan or a different delivery configuration depending on Cloudinary account limits.

## Security and implementation notes

This project archive has not been verified as a production deployment. Review the authentication model, add login and public-endpoint rate limiting, and run the full build plus end-to-end checks before exposing the site publicly. Keep the admin password and all service credentials private. HTML is sanitized before published article content is rendered.


## Article editor enhancements

- Cover image panel supports direct upload to Cloudinary or pasting an image URL, with a preview and remove action.
- Rich-text toolbar includes formatting, headings, lists, quotes, links, dividers, image/GIF upload, image/GIF URLs, video uploads, undo/redo, and a narrower focus-writing mode.
- Reader actions can be configured per post using presets (subscribe, like, comments, share, support) or custom buttons. Edit the label, supporting text, visibility, and external destination where relevant.
- Support actions open the built-in NGN/USD contribution modal and initialize Paystack checkout on the server. Never paste a secret API key into the CMS or browser.
- Configured actions can appear near the end of a post, while inline reader actions can be inserted at the cursor using the editor toolbar. Inline like, comment, and share prompts open the same interaction modals as the article action bar.

The final audit aligned `package.json` with the included pnpm lockfile and pinned Next.js 16.4.3 / React 19.3.1. Dependency installation could not complete in the audit environment because registry access timed out, so run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm lint`, and `pnpm audit` before deploying.


## Layout principles

The public site and admin are intentionally one-column by default:
- Home and Shelf flow vertically rather than using repeated card grids.
- Article content uses a centred reading column.
- The post editor is the main focus, with post settings beneath it.
- Post settings and the publishing checklist use progressive disclosure so secondary controls do not compete with writing.
- Reader actions use clear, centered CTA buttons, and optional in-article buttons can be inserted between paragraphs.


## Shelf, likes, comments, and sharing

- The public writing archive is called **Shelf** and lives at `/shelf`.
- Older `/journal` URLs redirect to the matching Shelf route.
- Published posts have a like flow that asks readers for their name and email. The normalized email is used to prevent duplicate likes per post; reader details can be remembered in local storage on that browser.
- Comments require a name, email address, and comment text. Email addresses are stored privately and are never returned to the public comments feed.
- Comments are currently published immediately. Before a high-traffic public launch, consider adding moderation, rate limiting, and anti-spam protection.
- Readers can share posts on X, Facebook, LinkedIn, WhatsApp, or copy the article link.
- Likes and comments are stored in separate MongoDB collections (`post_likes` and `post_comments`).


## Article engagement, sharing, and SEO

- Like, comment, and share actions are compact icon controls; each opens a modal so the article page stays focused on reading.
- Share modal offers WhatsApp, X, Facebook, LinkedIn, copy-link, and the device-native share sheet where supported.
- Article pages include canonical URLs, Open Graph metadata, Twitter large-image cards, and Article JSON-LD structured data.
- Published posts with cover images use those images for social previews. Posts without a cover image fall back to `public/og-default.png`.
- Each article includes a recommended next read from the published Shelf.
- Set `NEXT_PUBLIC_SITE_URL` to the actual production domain before deployment. Social networks may cache previews; use their sharing/debugging tools to refresh cached previews after changing metadata or cover images.


## Reader engagement and inline actions

- Article actions use a compact, higher-contrast action bar; likes, comments, and sharing open focused modals.
- In the rich-text editor, use **Button** in the toolbar to open a focused insert dialog. Choose support, like, comments, share, or a custom external link; edit the button label and preview its appearance before inserting it at the current cursor. In the article, it renders as a centered pill-style CTA button rather than a large callout card. Footer action cards can still be configured from the Reader actions panel.
- Every article ends with a subscribe CTA and a support CTA. The subscribe CTA remembers a successful subscription on that browser and hides the subscribe action afterward; the canonical subscriber record is stored in MongoDB.
- Support cards open a minimal contribution modal with a suggested **Buy me a coffee** amount (₦2,500 or $5) plus an optional custom amount.
- Currency is selected automatically from trusted hosting edge country headers: Nigeria defaults to NGN; other detected countries default to USD. If the hosting provider does not pass a country header, the site safely defaults to NGN. Dollar prices are separate tiers, not currency conversions. There is no currency toggle in the modal.


## Subscriber email workflow

- Public subscriptions are stored in the MongoDB `subscribers` collection with a unique normalized email, active/unsubscribed status, and an unsubscribe token. A returning active subscriber is not sent another welcome email.
- Brevo sends a welcome email to a new subscriber and owner notifications for new subscriptions, comments, likes, and confirmed contributions. Confirmed contributions also trigger a thank-you email to the supporter. Email failures are logged and should be monitored in production; the core interaction/payment record is kept even if email delivery is unavailable.
- In the new/edit post screen, enable **Email this post to all active subscribers** to send the article when it is first published. It defaults off, and republishing an already-published post does not trigger a second broadcast. The broadcast sends individual messages, so monitor Brevo quotas and use a queued campaign workflow if the list grows substantially.
- Brevo requires a verified sender. Configure `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, and `SITE_OWNER_EMAIL` in the host environment. The unsubscribe link is included in welcome and new-post emails.
- Text alignment is stored as inline `text-align` on supported paragraphs/headings and retained by the public HTML sanitizer. Select an image or GIF in the editor and use **Alt text** to update its accessibility description while editing a draft or published post.

## Paystack setup (required before accepting real contributions)

1. Add `PAYSTACK_SECRET_KEY` to your hosting provider's **server-side environment variables**. Never add it to a `NEXT_PUBLIC_` variable, client component, repository, or article editor. Start with a Paystack test secret key.
2. Set `NEXT_PUBLIC_SITE_URL` to your actual HTTPS domain in production. For local development only, `http://localhost:3000` is accepted so Paystack test transactions can return to your local verification page.
3. In the Paystack Dashboard, configure the account for the currencies/payment methods you intend to accept. USD checkout depends on account eligibility and Paystack configuration; if USD is unavailable, the API returns a clear checkout error rather than claiming payment succeeded.
4. Configure the Paystack webhook URL as `https://YOUR-DOMAIN/api/payments/webhook`. The endpoint verifies `x-paystack-signature` using HMAC-SHA512 and verifies successful transactions against Paystack's transaction-verify API before marking them successful.
5. Test successful payments, abandoned checkout, invalid signatures, duplicate webhook deliveries, mismatched amount/currency, and both NGN/USD before switching to a live key.



If a successful Paystack return is not immediately confirmed, the `/support/verify` page now offers **Check payment again**. The server verifies directly with Paystack and can recover a missing local payment record only after Paystack confirms the transaction as successful. If verification still fails, check that `PAYSTACK_SECRET_KEY` matches the environment used to initialize the transaction and that `MONGODB_URI` / `MONGODB_DB` point to the expected database.

The server validates the amount and currency, stores a pending reference in MongoDB, and verifies the payment server-side. The browser's redirect alone is not trusted as proof of payment. Current amount limits in the API are NGN 1,000–500,000 and USD 2–5,000. These should be reconciled with your live Paystack account settings before launch. Contributions are recorded in the `support_payments` collection; no card details are stored by this app.


## Site analytics and reading progress

- Public pages record page views, tracked link/button clicks, and article reading milestones at 25%, 50%, 75%, and 100%. Admin routes are excluded.
- The admin dashboard shows the last 30 days of page views, approximate unique readers, click totals, article views/clicks/completed reads, and most-clicked actions.
- Events are stored in the MongoDB `analytics_events` collection. A random first-party browser identifier is saved in local storage to estimate unique readers; no name, email, IP address, or full query string is intentionally collected by the analytics event endpoint.
- Article pages show a slim reading-progress indicator at the top of the viewport. It is deliberately subtle and also records reading-depth milestones.
- Analytics are first-party and lightweight; metrics will begin accumulating after this version is deployed. Historical visits cannot be backfilled.


## Article-level analytics

The admin dashboard includes individual insights for each published article. Expand an article under **Article performance** to review page views, unique readers, tracked clicks, reading completion and depth, share actions by destination, unique readers who initiated sharing, and lifetime like/comment totals. Share actions measure a click on a share destination, native share-sheet completion, or copying the link. They do **not** prove that a reader completed a repost on an external social platform; those platforms generally do not expose that confirmation without their own authenticated analytics APIs.

## Animation builder (stop-motion image sequences)

- The article editor toolbar includes **Animation builder**. Select multiple image frames and upload them to Cloudinary; the editor keeps the uploaded frame URLs in the article content.
- Frames play in the order shown on the horizontal timeline. Drag frames left or right to reorder them, click a thumbnail to inspect that frame, or use Alt + Left/Right Arrow while a frame is focused. Remove individual frames before inserting.
- Use the preview player and timeline scrubber to inspect exact frames and timestamps. Configure playback speed (2–24 fps), loop continuously or play once, and provide descriptive alt text.
- The editor embeds the animation at the current writing cursor. Select an inserted animation and choose its pencil-shaped **Edit animation frames** control to reopen the builder with its existing frames, order, speed, loop setting, and alt text. Saving replaces that animation in place instead of inserting a duplicate. The published article animates the sequence in place and includes a small play/pause control, so it works as part of the article rather than as an external video.
- Each frame is an ordinary Cloudinary image asset (10 MB per image limit). Cloudinary must be configured using the server-side credentials described above. Use similarly sized frames for a smoother visual result.

### Editor media improvements

- Drag image files directly from your desktop into the rich-text editor; multiple images are inserted at the drop position.
- Image delivery URLs use Cloudinary `q_auto:best,f_auto` transformations to preserve high visual quality while selecting efficient browser-supported formats. The original uploaded asset remains available in Cloudinary.
- Stop-motion frames are preloaded and use a brief crossfade between frames to reduce the harshness of limited-frame playback.
- Editor dropdowns use the custom accessible dropdown component rather than native select controls.

- Animation timeline: select a frame and enter its **Selected frame order** to reposition it; the rest of the sequence adjusts automatically.

## Subtle motion polish

The public pages use restrained page-entry fades, viewport-triggered reveal animations, and a gentle stagger for article rows. Small hover transitions are applied to key visual elements. The shared `MotionReveal` component uses `IntersectionObserver` with a zero threshold so even short viewport intersections trigger a reveal, reveals content by default when JavaScript is unavailable, and respects `prefers-reduced-motion`. Long article bodies and interactive admin editing screens intentionally remain outside reveal/page-entry animations so content and controls never disappear during hydration or scrolling.


### Verify transactional email delivery

After configuring `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, and `SITE_OWNER_EMAIL`, sign in to the CMS and send an authenticated test request:

```bash
curl -X POST https://YOUR-DOMAIN/api/admin/email/test \
  -H "Cookie: YOUR_ADMIN_SESSION_COOKIE"
```

A successful response means Brevo accepted the test message; confirm actual delivery in the recipient inbox and Brevo's transactional logs. The sender address must be verified in Brevo. Payment thank-you emails are triggered only after Paystack confirms a successful transaction.
