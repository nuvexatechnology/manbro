import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  isAdminLoginConfigured,
  isSameOrigin,
} from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  }
  if (!isAdminLoginConfigured()) {
    return NextResponse.json({ error: "Admin login is unavailable" }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  }
  if (!body || typeof body !== "object" || !("email" in body) || !("password" in body) ||
      typeof body.email !== "string" || !body.email.trim() || body.email.length > 320 ||
      typeof body.password !== "string" || !body.password || body.password.length > 4096) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400, headers });
  }

  try {
    // Never sign a user into the shared service-role database client.
    const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error || !data.session || data.user?.app_metadata?.role !== "admin") {
      if (data.session) await authClient.auth.signOut({ scope: "local" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers });
    }

    const expiresAt = Math.min(data.session.expires_at ?? 0, Math.floor(Date.now() / 1000) + 3600);
    const maxAge = Math.floor(expiresAt - Date.now() / 1000);
    if (!Number.isFinite(maxAge) || maxAge <= 0) {
      return NextResponse.json({ error: "Admin login is unavailable" }, { status: 503, headers });
    }
    const response = NextResponse.json({ success: true }, { headers });
    response.cookies.set(ADMIN_COOKIE, data.session.access_token, {
      ...ADMIN_COOKIE_OPTIONS,
      expires: new Date(expiresAt * 1000),
      maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Admin login is unavailable" }, { status: 503, headers });
  }
}
