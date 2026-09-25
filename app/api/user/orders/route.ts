import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { getDb } from "@/lib/db/client";
import type { Order } from "@/types/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cleanPhone = user.phone.replace(/\D/g, "");
    if (!cleanPhone || !/^\d{8,15}$/.test(cleanPhone)) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const { data, error } = await getDb()
      .from("manbro_orders")
      .select("data")
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: "Unable to fetch orders." }, { status: 500 });
    }

    const orders = (data || []).map((row) => {
      const o = row.data as Order;
      // Return a safe customer-visible subset
      return {
        id: o.id,
        createdAt: o.createdAt,
        items: o.items,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        status: o.status,
        trackingInfo: o.trackingInfo,
      };
    });

    return NextResponse.json(
      { success: true, orders },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Orders unavailable." }, { status: 500 });
  }
}
