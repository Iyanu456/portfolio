import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "iyanu_admin_session";
function signature(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function createSessionToken() {
  const value = `${Date.now() + 1000 * 60 * 60 * 24 * 7}`;
  return `${value}.${signature(value)}`;
}
export function isValidToken(token?: string) {
  if (!token) return false;
  try {
    const [value, sig, extra] = token.split(".");
    if (!value || !sig || extra || !/^\d+$/.test(value) || !/^[a-f0-9]{64}$/i.test(sig) || Number(value) < Date.now()) return false;
    const expected = signature(value);
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    // Missing or invalid AUTH_SECRET must deny access, not crash protected routes.
    return false;
  }
}
export async function isAdmin() {
  const jar = await cookies();
  return isValidToken(jar.get(COOKIE_NAME)?.value);
}
export const SESSION_COOKIE = COOKIE_NAME;
