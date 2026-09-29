import "server-only";

import { cookies } from "next/headers";
import { getDb } from "@/lib/db/client";

export const USER_COOKIE = "manbro_user_session";
export const USER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  email: string;
}

/**
 * Normalizes phone numbers to standard 10-15 digit string
 */
export function normalizePhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Maps a phone number to an internal user email for Supabase Auth
 */
export function phoneToUserEmail(phone: string): string {
  const clean = normalizePhone(phone);
  return `user_${clean}@manbro.user`;
}

export function isUserAuthAvailable(): boolean {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    if (!token) return null;

    const { data, error } = await getDb().auth.getUser(token);
    if (error || !data.user) return null;

    // Must not be an admin impersonating or admin-only session if role is admin without user metadata
    const phone = data.user.user_metadata?.phone || data.user.phone || "";
    const name = data.user.user_metadata?.name || data.user.user_metadata?.full_name || "Customer";
    
    return {
      id: data.user.id,
      name,
      phone: normalizePhone(phone),
      email: data.user.email || "",
    };
  } catch {
    return null;
  }
}
