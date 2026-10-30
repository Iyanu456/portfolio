import { NextResponse } from "next/server";
import { getSubscribers } from "@/lib/email";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!/^[a-f0-9]{48}$/.test(token)) return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  try {
    const subscribers = await getSubscribers();
    const result = await subscribers.updateOne({ unsubscribeToken: token, status: "ACTIVE" }, { $set: { status: "UNSUBSCRIBED", updatedAt: new Date() } });
    const destination = new URL("/shelf", process.env.NEXT_PUBLIC_SITE_URL || request.url);
    destination.searchParams.set("unsubscribed", result.modifiedCount ? "1" : "already");
    return NextResponse.redirect(destination, 303);
  } catch {
    return new NextResponse("We couldn't update your subscription right now. Please try again later.", { status: 503 });
  }
}
