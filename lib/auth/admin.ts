import "server-only";

import { cookies } from "next/headers";
import { getDb } from "@/lib/db/client";

export const ADMIN_COOKIE = "manbro_admin_session";
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function isAdminLoginConfigured(): boolean {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) return false;
  if (SUPABASE_ANON_KEY === SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY.startsWith("sb_secret_")) return false;
  try {
    return ["http:", "https:"].includes(new URL(SUPABASE_URL).protocol);
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    const { data, error } = await getDb().auth.getUser(token);
    return !error && data.user?.app_metadata?.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export function isSameOrigin(request: Request): boolean {
  try {
    const origin = request.headers.get("origin");
    if (!origin || origin === "null") return false;
    // Match the actual origin (including local development ports), not forwarded headers.
    if (origin === new URL(request.url).origin) return true;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    return !!appUrl && origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
