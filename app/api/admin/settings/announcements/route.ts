import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/auth/admin";
import { getAnnouncementSettings, saveAnnouncementSettings } from "@/lib/db/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await getAnnouncementSettings();
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { freeShippingText, offerText, offerCode, isEnabled } = body;

    const saved = await saveAnnouncementSettings({
      freeShippingText: typeof freeShippingText === "string" ? freeShippingText.trim() : "",
      offerText: typeof offerText === "string" ? offerText.trim() : "",
      offerCode: typeof offerCode === "string" ? offerCode.trim() : "",
      isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
    });

    return NextResponse.json({ success: true, settings: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
  }
}
