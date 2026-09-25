import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, USER_COOKIE_OPTIONS } from "@/lib/auth/user";
import { isSameOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  }

  const token = request.cookies.get(USER_COOKIE)?.value;
  if (token) {
    try {
      await getDb().auth.admin.signOut(token, "local");
    } catch {
      // Local signout continues
    }
  }

  const response = NextResponse.json({ success: true }, { headers });
  response.cookies.set(USER_COOKIE, "", {
    ...USER_COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
