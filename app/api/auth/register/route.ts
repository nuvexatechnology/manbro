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
import { userRegisterSchema } from "@/lib/validators/user";

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

  const validation = userRegisterSchema.safeParse(body);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ error: errorMsg }, { status: 400, headers });
  }

  const { name, mobileNumber, password } = validation.data;
  const userEmail = phoneToUserEmail(mobileNumber);
  const cleanPhone = normalizePhone(mobileNumber);

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }
    );

    // Create user in Supabase Auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone: cleanPhone,
        registered_at: new Date().toISOString(),
      },
    });

    if (createError) {
      if (
        createError.message?.toLowerCase().includes("already registered") ||
        createError.message?.toLowerCase().includes("user already exists") ||
        createError.status === 422
      ) {
        return NextResponse.json(
          { error: "A user with this mobile number is already registered. Please sign in instead." },
          { status: 409, headers }
        );
      }
      return NextResponse.json(
        { error: createError.message || "Failed to create account" },
        { status: 400, headers }
      );
    }

    // Sign the user in to get an active session JWT
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }
    );

    const { data: signinData, error: signinError } = await anonClient.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (signinError || !signinData.session) {
      return NextResponse.json(
        {
          success: true,
          message: "Registration successful. Please sign in.",
          user: {
            id: createData.user?.id,
            name,
            phone: cleanPhone,
          },
        },
        { headers }
      );
    }

    const expiresAt = Math.min(
      signinData.session.expires_at ?? 0,
      Math.floor(Date.now() / 1000) + 30 * 24 * 3600 // 30 days
    );
    const maxAge = Math.floor(expiresAt - Date.now() / 1000);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account registered successfully",
        user: {
          id: signinData.user?.id,
          name,
          phone: cleanPhone,
        },
      },
      { headers }
    );

    response.cookies.set(USER_COOKIE, signinData.session.access_token, {
      ...USER_COOKIE_OPTIONS,
      expires: new Date(expiresAt * 1000),
      maxAge: Math.max(maxAge, 3600),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed. Please try again." },
      { status: 500, headers }
    );
  }
}
