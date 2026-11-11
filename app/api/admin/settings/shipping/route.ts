import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/auth/admin";
import {
  getShippingSettings,
  saveShippingSettings,
  getAnnouncementSettings,
  saveAnnouncementSettings,
} from "@/lib/db/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await getShippingSettings();
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Failed to load shipping settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const {
      standardShippingFee,
      freeShippingThreshold,
      isFreeShippingEnabled,
      estimatedDeliveryDays,
      syncAnnouncement,
    } = body;

    const fee = typeof standardShippingFee === "number" && !isNaN(standardShippingFee) && standardShippingFee >= 0
      ? Math.round(standardShippingFee * 100) / 100
      : 70;

    const threshold = typeof freeShippingThreshold === "number" && !isNaN(freeShippingThreshold) && freeShippingThreshold >= 0
      ? Math.round(freeShippingThreshold * 100) / 100
      : 499;

    const isFree = typeof isFreeShippingEnabled === "boolean" ? isFreeShippingEnabled : true;
    const estDays = typeof estimatedDeliveryDays === "string" ? estimatedDeliveryDays.trim() : "3-5 business days";

    const saved = await saveShippingSettings({
      standardShippingFee: fee,
      freeShippingThreshold: threshold,
      isFreeShippingEnabled: isFree,
      estimatedDeliveryDays: estDays,
    });

    // Optionally sync top header announcement banner
    if (syncAnnouncement === true) {
      const currentAnnounce = await getAnnouncementSettings();
      const updatedText = isFree
        ? `FREE SHIPPING ON ORDERS OVER ₹${Math.round(threshold)}`
        : `STANDARD DELIVERY FLAT ₹${Math.round(fee)}`;

      await saveAnnouncementSettings({
        ...currentAnnounce,
        freeShippingText: updatedText,
      });
    }

    return NextResponse.json({ success: true, settings: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update shipping settings" }, { status: 500 });
  }
}
