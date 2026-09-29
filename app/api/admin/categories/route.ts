import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/auth/admin";
import { getCategories } from "@/lib/db/catalog";
import { getDb } from "@/lib/db/client";
import { categoryInput } from "@/lib/validators/store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ success: true, categories: await getCategories() }); }
  catch { return NextResponse.json({ error: "Categories unavailable" }, { status: 503 }); }
}
async function save(request: NextRequest, update: boolean) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const parsed = categoryInput.safeParse(body);
    if (!parsed.success || (update && typeof body.id !== "string")) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    const row = { ...parsed.data, updated_at: new Date().toISOString() };
    const db = getDb();
    const { data, error } = update
      ? await db.from("manbro_categories").update(row).eq("id", body.id).select().single()
      : await db.from("manbro_categories").insert({ ...row, id: `cat-${randomUUID()}` }).select().single();
    if (error) return NextResponse.json({ error: "Category name/slug must be unique. Assigned categories cannot be renamed." }, { status: 409 });
    return NextResponse.json({ success: true, category: data });
  } catch { return NextResponse.json({ error: "Unable to save category" }, { status: 503 }); }
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PUT(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Category ID required" }, { status: 400 });
  try {
    const { error } = await getDb().from("manbro_categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Reassign products before deleting this category." }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Unable to delete category" }, { status: 503 }); }
}
