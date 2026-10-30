import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdmin } from "@/lib/auth";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Media uploads need Cloudinary credentials. Add them to your environment settings." }, { status: 503 });
  }
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image, GIF, or video to upload." }, { status: 400 });
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isImage && !isVideo) return NextResponse.json({ error: "Only image, GIF, and video files are allowed." }, { status: 400 });
  const limit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > limit) return NextResponse.json({ error: isVideo ? "Videos must be 50 MB or smaller." : "Images and GIFs must be 10 MB or smaller." }, { status: 413 });
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "iyanu-publication", resource_type: isVideo ? "video" : "image" }, (error, uploaded) => error ? reject(error) : resolve(uploaded));
      stream.end(bytes);
    });
    // Keep the original asset stored in Cloudinary, but deliver image files through
    // its best-quality automatic format/quality negotiation. This keeps detail while
    // reducing transfer size (AVIF/WebP where supported, with a safe fallback).
    // Cloudinary still serves the source asset unchanged at result.secure_url.
    const deliveredUrl = !isVideo
      ? result.secure_url.replace("/upload/", "/upload/q_auto:best,f_auto/")
      : result.secure_url;
    return NextResponse.json({ url: deliveredUrl, originalUrl: result.secure_url, name: file.name, resourceType: isVideo ? "video" : "image", mimeType: file.type });
  } catch {
    return NextResponse.json({ error: "Upload failed. Check your media settings and try again." }, { status: 500 });
  }
}
