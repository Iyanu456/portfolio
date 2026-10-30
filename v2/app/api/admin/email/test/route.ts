import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const recipient = process.env.SITE_OWNER_EMAIL;
  if (!recipient) return NextResponse.json({ error: "SITE_OWNER_EMAIL is missing." }, { status: 503 });
  const result = await sendEmail(
    { email: recipient, name: "Iyanu Oyerinde" },
    "Your publication email setup is working",
    `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#222"><h1>Email test successful</h1><p>This test confirms that your website can send transactional email through Brevo.</p></div>`,
    "This test confirms that your website can send transactional email through Brevo.",
  );
  if (!result.sent) {
    return NextResponse.json({ ok: false, error: "Brevo did not accept the test email. Check the server logs for the provider response and confirm the sender address is verified in Brevo.", reason: result.reason }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: `Test email accepted by Brevo for ${recipient}. Check the inbox and spam folder.` });
}
