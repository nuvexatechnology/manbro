import { NextResponse } from "next/server";
import { isAdmin, isAdminLoginConfigured } from "@/lib/auth/admin";

export async function GET() {
  const authenticated = await isAdmin();
  const loginEnabled = isAdminLoginConfigured();
  return NextResponse.json(
    { authenticated, loginEnabled },
    {
      status: authenticated ? 200 : loginEnabled ? 401 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
