import { NextResponse } from "next/server";
import { getAnnouncementSettings } from "@/lib/db/settings";

export async function GET() {
  try {
    const settings = await getAnnouncementSettings();
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}
