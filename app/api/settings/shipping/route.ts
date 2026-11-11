import { NextResponse } from "next/server";
import { getShippingSettings } from "@/lib/db/settings";

export async function GET() {
  try {
    const settings = await getShippingSettings();
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Failed to load shipping settings" }, { status: 500 });
  }
}
