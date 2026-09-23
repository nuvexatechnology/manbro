import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db/catalog";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");
    const products = (await getProducts()).filter(p => !category || p.category.toLowerCase() === category.toLowerCase());
    return NextResponse.json({ success: true, count: products.length, products }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ success: false, error: "Catalog temporarily unavailable." }, { status: 503 }); }
}
