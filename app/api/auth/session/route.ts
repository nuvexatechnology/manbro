import { NextResponse } from "next/server";
import { getCurrentUser, isUserAuthAvailable } from "@/lib/auth/user";

export async function GET() {
  const user = await getCurrentUser();
  const available = isUserAuthAvailable();

  return NextResponse.json(
    {
      authenticated: Boolean(user),
      user: user || null,
      available,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
