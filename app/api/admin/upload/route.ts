import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/client";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };

  const authorized = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400, headers });
    }

    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400, headers });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    let extension = "jpg";
    if (file instanceof File && file.name) {
      const parts = file.name.split(".");
      if (parts.length > 1) {
        extension = parts.pop()?.toLowerCase() || "jpg";
      }
    } else if (mimeType.includes("png")) {
      extension = "png";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    }

    const filename = `prod-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const db = getDb();

    const { data: uploadData, error: uploadError } = await db.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload image to storage" },
        { status: 500, headers }
      );
    }

    const { data: publicUrlData } = db.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);

    return NextResponse.json(
      {
        success: true,
        url: publicUrlData.publicUrl,
        filename,
      },
      { headers }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process image upload" },
      { status: 500, headers }
    );
  }
}
