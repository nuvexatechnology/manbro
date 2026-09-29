import "server-only";

export interface CreateCashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  returnUrl?: string;
}

export function isCashfreeConfigured(): boolean {
  const appId = process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  return Boolean(appId && secretKey);
}

export function getCashfreeEnv(): "SANDBOX" | "PRODUCTION" {
  return process.env.CASHFREE_ENV === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";
}

export async function createCashfreeOrderSession(params: CreateCashfreeOrderParams): Promise<{
  paymentSessionId?: string;
  orderId: string;
  cfOrderId?: string;
  error?: string;
}> {
  const appId = process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = getCashfreeEnv();

  // If not configured with API keys, return mock session for development/demo
  if (!appId || !secretKey) {
    console.warn("Cashfree keys not set in .env. Falling back to development mock session mode.");
    return {
      paymentSessionId: `mock_session_${params.orderId}_${Date.now()}`,
      orderId: params.orderId,
    };
  }

  const baseUrl = env === "PRODUCTION"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const returnUrl = params.returnUrl || `${appUrl}/checkout/success?order_id={order_id}`;

  const payload = {
    order_id: params.orderId,
    order_amount: Math.round(params.orderAmount * 100) / 100,
    order_currency: params.orderCurrency || "INR",
    customer_details: {
      customer_id: params.customerDetails.customerId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50),
      customer_name: params.customerDetails.customerName.slice(0, 100),
      customer_email: params.customerDetails.customerEmail.slice(0, 100),
      customer_phone: params.customerDetails.customerPhone.replace(/\D/g, "").slice(-10),
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: `${appUrl}/api/cashfree/webhook`,
    },
    order_note: `MANBRO Order ${params.orderId}`,
  };

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree order creation error:", data);
      return {
        orderId: params.orderId,
        error: data.message || "Failed to create Cashfree payment order.",
      };
    }

    return {
      paymentSessionId: data.payment_session_id,
      cfOrderId: data.cf_order_id,
      orderId: data.order_id || params.orderId,
    };
  } catch (err) {
    console.error("Cashfree API network error:", err);
    return {
      orderId: params.orderId,
      error: "Unable to contact Cashfree payment gateway. Please try again.",
    };
  }
}

export async function verifyCashfreePayment(orderId: string): Promise<{
  isPaid: boolean;
  orderStatus?: string;
  paymentDetails?: any;
  error?: string;
}> {
  const appId = process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = getCashfreeEnv();

  if (!appId || !secretKey) {
    // In demo/mock mode, assume success if session was mock
    return { isPaid: true, orderStatus: "PAID" };
  }

  const baseUrl = env === "PRODUCTION"
    ? `https://api.cashfree.com/pg/orders/${orderId}`
    : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

  try {
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { isPaid: false, error: data.message };
    }

    const isPaid = data.order_status === "PAID";
    return {
      isPaid,
      orderStatus: data.order_status,
      paymentDetails: data,
    };
  } catch (err) {
    return { isPaid: false, error: "Payment verification error" };
  }
}
