import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/client";
import { getProducts } from "@/lib/db/catalog";
import { productInput } from "@/lib/validators/store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ success: true, products: await getProducts() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Catalog unavailable" }, { status: 503 }); }
}

async function save(request: NextRequest, update: boolean) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const parsed = productInput.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`).join("; ");
      console.error("Product validation error:", errorMsg);
      return NextResponse.json({ error: `Invalid product details: ${errorMsg}`, details: parsed.error.issues }, { status: 400 });
    }
    const db = getDb();
    const id = update ? body.id : `prod-${randomUUID()}`;
    if (typeof id !== "string" || (update && !Number.isInteger(body.version))) return NextResponse.json({ error: "Refresh the product before editing." }, { status: 400 });
    const previous = update ? await db.from("manbro_products").select("data").eq("id", id).single() : null;
    if (previous?.error) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = { details: [], rating: 0, reviewCount: 0, isFeatured: false, isNewArrival: true, tags: [], ...previous?.data?.data, ...parsed.data, id,
      originalPrice: parsed.data.originalPrice ?? null, colorImages: parsed.data.colorImages ?? null, inStock: parsed.data.variants.some(v => v.stock > 0) };
    const row = { id, slug: product.slug, category: product.category, data: product };
    const result = update
      ? await db.from("manbro_products").update(row).eq("id", id).eq("version", body.version).select("data,version").maybeSingle()
      : await db.from("manbro_products").insert(row).select("data,version").single();
    if (result.error) return NextResponse.json({ error: `Product could not be saved. ${result.error.message || "Check category and unique slug."}` }, { status: 409 });
    if (!result.data) return NextResponse.json({ error: "Stock or product details changed. Reload before saving." }, { status: 409 });
    return NextResponse.json({ success: true, product: { ...result.data.data, version: result.data.version } });
  } catch (err: any) {
    console.error("Error saving product:", err);
    return NextResponse.json({ error: `Unable to save product: ${err?.message || "Server error"}` }, { status: 503 });
  }
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PUT(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  try {
    const { error } = await getDb().from("manbro_products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Unable to delete product" }, { status: 503 }); }
}
