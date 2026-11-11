import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyCashfreePayment } from "@/lib/cashfree";
import { confirmOrderPaymentInDb } from "@/lib/db/supabase";

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // Verify Cashfree Webhook Signature if header is provided
    if (signature && timestamp && secretKey) {
      try {
        const computedSignature = crypto
          .createHmac("sha256", secretKey)
          .update(timestamp + rawText)
          .digest("base64");

        const sigBuf = Buffer.from(signature);
        const compBuf = Buffer.from(computedSignature);

        if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
        }
      } catch (sigErr) {
        console.error("Webhook signature check error:", sigErr);
        return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
      }
    }

    let rawBody: any;
    try {
      rawBody = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }

    // Cashfree PG webhook payload structure:
    // data.order.order_id or data.order_id or rawBody.orderId
    const orderId =
      rawBody?.data?.order?.order_id ||
      rawBody?.data?.order_id ||
      rawBody?.order_id ||
      rawBody?.data?.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid webhook payload, order_id missing" }, { status: 400 });
    }

    // Direct server-to-server verification with Cashfree API
    const verification = await verifyCashfreePayment(orderId);

    if (verification.isPaid) {
      await confirmOrderPaymentInDb(orderId);
      return NextResponse.json({ status: "SUCCESS", orderId, orderStatus: "PAID" }, { status: 200 });
    }

    return NextResponse.json(
      { status: "RECEIVED", orderId, orderStatus: verification.orderStatus || "PENDING" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Cashfree webhook processing error:", err);
    return NextResponse.json({ error: "Webhook error", details: err?.message }, { status: 500 });
  }
}
