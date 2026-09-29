import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };

  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { data, error } = await getDb().auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500, headers });
    }

    // Filter out admin users and format customer data
    const users = (data.users || [])
      .filter((u) => u.app_metadata?.role !== "admin")
      .map((u) => {
        const name = u.user_metadata?.name || u.user_metadata?.full_name || "Customer";
        const phone = u.user_metadata?.phone || u.phone || u.email?.replace(/@manbro\.user$/, "").replace(/^user_/, "") || "";
        return {
          id: u.id,
          name,
          phone,
          email: u.email || "",
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || u.created_at,
        };
      });

    return NextResponse.json({ success: true, users }, { headers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load users" },
      { status: 500, headers }
    );
  }
}
