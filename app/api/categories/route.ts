import { NextResponse } from "next/server";
import { getCategories } from "@/lib/db/catalog";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(
      { success: true, count: categories.length, categories },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Categories temporarily unavailable." },
      { status: 503 }
    );
  }
}
