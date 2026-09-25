import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSameOrigin } from "@/lib/auth/admin";
import {
  USER_COOKIE,
  USER_COOKIE_OPTIONS,
  phoneToUserEmail,
  normalizePhone,
  isUserAuthAvailable,
} from "@/lib/auth/user";
import { userLoginSchema } from "@/lib/validators/user";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  }

  if (!isUserAuthAvailable()) {
    return NextResponse.json(
      { error: "Authentication service is currently unavailable" },
      { status: 503, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400, headers });
  }

  const validation = userLoginSchema.safeParse(body);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ error: errorMsg }, { status: 400, headers });
  }

  const { mobileNumber, password } = validation.data;
  const userEmail = phoneToUserEmail(mobileNumber);
  const cleanPhone = normalizePhone(mobileNumber);

  try {
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }
    );

    const { data, error } = await anonClient.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Invalid mobile number or password" },
        { status: 401, headers }
      );
    }

    const name = data.user?.user_metadata?.name || "Customer";

    const expiresAt = Math.min(
      data.session.expires_at ?? 0,
      Math.floor(Date.now() / 1000) + 30 * 24 * 3600 // 30 days
    );
    const maxAge = Math.floor(expiresAt - Date.now() / 1000);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          name,
          phone: cleanPhone,
        },
      },
      { headers }
    );

    response.cookies.set(USER_COOKIE, data.session.access_token, {
      ...USER_COOKIE_OPTIONS,
      expires: new Date(expiresAt * 1000),
      maxAge: Math.max(maxAge, 3600),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed. Please try again." },
      { status: 500, headers }
    );
  }
}
