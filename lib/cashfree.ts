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
  const configuredEnv = (process.env.CASHFREE_ENV || "").trim().toUpperCase();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || "").trim();

  // If user explicitly configured SANDBOX mode, honor SANDBOX
  if (configuredEnv === "SANDBOX") {
    return "SANDBOX";
  }

  // Detect environment from Cashfree secret key prefix:
  // cfsk_ma_prod_ -> Live Production API (https://api.cashfree.com)
  // cfsk_ma_test_ -> Sandbox Test API (https://sandbox.cashfree.com)
  if (secretKey.startsWith("cfsk_ma_prod_")) {
    return "PRODUCTION";
  }
  if (secretKey.startsWith("cfsk_ma_test_")) {
    return "SANDBOX";
  }

  return configuredEnv === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";
}

export async function createCashfreeOrderSession(params: CreateCashfreeOrderParams): Promise<{
  paymentSessionId?: string;
  orderId: string;
  cfOrderId?: string;
  environment?: "SANDBOX" | "PRODUCTION";
  error?: string;
}> {
  const appId = (process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || "").trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || "").trim();
  const env = getCashfreeEnv();

  // If in SANDBOX mode and test keys are not configured yet, provide local sandbox test session
  if (!appId || !secretKey || appId.startsWith("your_") || secretKey.startsWith("your_")) {
    if (env === "SANDBOX") {
      return {
        paymentSessionId: `sandbox_dev_${params.orderId}_${Date.now()}`,
        orderId: params.orderId,
        environment: "SANDBOX",
      };
    }
    return {
      orderId: params.orderId,
      error: "Cashfree API keys are missing. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to .env.local",
    };
  }

  const baseUrl = env === "PRODUCTION"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

  const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002").trim();
  // Cashfree Production strictly enforces HTTPS for all endpoints and callbacks
  const secureAppUrl = rawAppUrl.startsWith("https://")
    ? rawAppUrl
    : rawAppUrl.replace(/^http:\/\//i, "https://");

  const returnUrl = params.returnUrl
    ? (env === "PRODUCTION" && params.returnUrl.startsWith("http://")
        ? params.returnUrl.replace(/^http:\/\//i, "https://")
        : params.returnUrl)
    : `${secureAppUrl}/checkout/success?order_id={order_id}`;

  const orderMeta: Record<string, string> = {
    return_url: returnUrl,
  };

  // Only pass notify_url if it's a public HTTPS URL (avoiding local private hosts that Cashfree servers cannot reach)
  if (secureAppUrl.startsWith("https://") && !secureAppUrl.includes("localhost") && !secureAppUrl.includes("127.0.0.1")) {
    orderMeta.notify_url = `${secureAppUrl}/api/cashfree/webhook`;
  }

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
    order_meta: orderMeta,
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
      console.error(`Cashfree order creation error (${env} mode):`, data);
      return {
        orderId: params.orderId,
        error: data.message || "Failed to create Cashfree payment order.",
      };
    }

    return {
      paymentSessionId: data.payment_session_id,
      cfOrderId: data.cf_order_id,
      orderId: data.order_id || params.orderId,
      environment: env,
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
  const appId = (process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || "").trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || "").trim();
  const env = getCashfreeEnv();

  if (!appId || !secretKey || appId.startsWith("your_") || secretKey.startsWith("your_")) {
    if (env === "SANDBOX") {
      return { isPaid: true, orderStatus: "PAID" };
    }
    return { isPaid: false, error: "Cashfree API keys are not configured in .env.local" };
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
