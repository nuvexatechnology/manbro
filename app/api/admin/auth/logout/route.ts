import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS, isSameOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      // Revoke this session's refresh token; issued JWTs can live until their expiry.
      await getDb().auth.admin.signOut(token, "local");
    } catch {
      // Local logout must still work if Supabase is unavailable or the JWT expired.
    }
  }
  const response = NextResponse.json({ success: true }, { headers });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...ADMIN_COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
