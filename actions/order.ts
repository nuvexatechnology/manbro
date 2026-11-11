"use server";

import { z } from "zod";
import type { CheckoutFormValues, CartItem, Order, OrderStatus, IndiaPostTracking } from "@/types/store";
import { checkoutInput, cartInput, orderStatusInput, trackingInput } from "@/lib/validators/store";
import { createOrderInDb, getOrderByIdAndPhone, getAllOrdersDb, updateOrderStatusDb, addIndiaPostTrackingDb, updateAdminNotesDb, getOrderById, confirmOrderPaymentInDb, syncOrderTotalsInDb } from "@/lib/db/supabase";
import { isAdmin } from "@/lib/auth/admin";
import { calculateTotals } from "@/lib/pricing";
import { getShippingSettings } from "@/lib/db/settings";

import { createCashfreeOrderSession, verifyCashfreePayment } from "@/lib/cashfree";

export async function processCashfreeOrderAction(formValues: CheckoutFormValues, cartItems: CartItem[], requestId: string) {
  const form = checkoutInput.safeParse(formValues);
  if (!form.success) {
    const validationErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};
    for (const issue of form.error.issues) validationErrors[issue.path[0] as keyof CheckoutFormValues] = issue.message;
    return { success: false, error: "Please provide complete and valid delivery address details.", validationErrors };
  }

  // Address validation guard: Address must not be empty or blank
  if (!form.data.address || form.data.address.trim().length < 5 || !form.data.city || !form.data.pincode) {
    return {
      success: false,
      error: "Shipping address is mandatory. Please enter complete delivery address before placing order.",
      validationErrors: { address: "Complete street address is required" },
    };
  }

  const cart = cartInput.safeParse(cartItems);
  if (!cart.success || !z.uuid().safeParse(requestId).success) {
    return { success: false, error: "Invalid shopping bag. Refresh and try again." };
  }

  let order: Order;
  try {
    order = await createOrderInDb(
      { ...form.data, paymentMethod: "cashfree" },
      cart.data.map(item => ({
        productId: item.product.id,
        size: item.selectedSize,
        color: item.selectedColor.name,
        quantity: item.quantity,
      })),
      requestId
    );
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to place order. Please retry." };
  }

  // Recalculate and synchronize order totals with active store settings (shipping threshold & 5% GST)
  try {
    const shippingSettings = await getShippingSettings();
    const accurateTotals = calculateTotals(order.subtotal, {
      freeShippingThreshold: shippingSettings.freeShippingThreshold,
      standardShippingFee: shippingSettings.standardShippingFee,
      isFreeShippingEnabled: shippingSettings.isFreeShippingEnabled,
    });

    order.shipping = accurateTotals.shipping;
    order.tax = accurateTotals.tax;
    order.total = accurateTotals.total;

    const syncedOrder = await syncOrderTotalsInDb(order.id, {
      shipping: accurateTotals.shipping,
      tax: accurateTotals.tax,
      total: accurateTotals.total,
    });
    if (syncedOrder) {
      order = syncedOrder;
    }
  } catch (syncErr) {
    console.warn("Could not sync live shipping totals to order, using base totals:", syncErr);
  }

  // Initiate Cashfree Session
  try {
    const session = await createCashfreeOrderSession({
      orderId: order.id,
      orderAmount: order.total,
      customerDetails: {
        customerId: `CUST-${order.shippingAddress.phone.slice(-10)}`,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim() || "Customer",
        customerEmail: order.shippingAddress.email,
        customerPhone: order.shippingAddress.phone,
      },
    });

    if (session.error || !session.paymentSessionId) {
      return {
        success: false,
        order,
        error: session.error || "Failed to create Cashfree payment session.",
      };
    }

    return {
      success: true,
      order,
      paymentSessionId: session.paymentSessionId,
      cfOrderId: session.cfOrderId,
      environment: session.environment,
    };
  } catch (err) {
    return {
      success: false,
      order,
      error: err instanceof Error ? err.message : "Unable to initiate Cashfree payment gateway session.",
    };
  }
}

export async function verifyCashfreeOrderAction(orderId: string) {
  if (typeof orderId !== "string" || !orderId.trim()) {
    return { success: false, error: "Invalid order identifier." };
  }

  try {
    const result = await verifyCashfreePayment(orderId);
    if (!result.isPaid) {
      return {
        success: false,
        isPaid: false,
        orderStatus: result.orderStatus || "PENDING",
        error: result.error || "Payment has not been confirmed yet.",
      };
    }

    // Mark order as CONFIRMED in database
    await confirmOrderPaymentInDb(orderId);
    const order = await getOrderById(orderId);

    return {
      success: true,
      isPaid: true,
      orderStatus: "CONFIRMED",
      order,
      paymentDetails: result.paymentDetails,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Payment verification failed.",
    };
  }
}

export async function processWhatsAppOrderAction(formValues: CheckoutFormValues, cartItems: CartItem[], requestId: string) {
  const form = checkoutInput.safeParse(formValues);
  if (!form.success) {
    const validationErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};
    for (const issue of form.error.issues) validationErrors[issue.path[0] as keyof CheckoutFormValues] = issue.message;
    return { success: false, error: "Please check your shipping details.", validationErrors };
  }
  const cart = cartInput.safeParse(cartItems);
  if (!cart.success || !z.uuid().safeParse(requestId).success) return { success: false, error: "Invalid shopping bag. Refresh and try again." };
  const phone = process.env.STORE_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!phone || !/^\d{8,15}$/.test(phone)) return { success: false, error: "Ordering is not configured yet. Please contact the store." };
  let order: Order;
  try {
    order = await createOrderInDb(form.data, cart.data.map(item => ({ productId: item.product.id, size: item.selectedSize, color: item.selectedColor.name, quantity: item.quantity })), requestId);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to save order. Please retry." };
  }

  // Recalculate totals with store shipping settings
  try {
    const shippingSettings = await getShippingSettings();
    const accurateTotals = calculateTotals(order.subtotal, {
      freeShippingThreshold: shippingSettings.freeShippingThreshold,
      standardShippingFee: shippingSettings.standardShippingFee,
      isFreeShippingEnabled: shippingSettings.isFreeShippingEnabled,
    });
    order.shipping = accurateTotals.shipping;
    order.tax = accurateTotals.tax;
    order.total = accurateTotals.total;
    const syncedOrder = await syncOrderTotalsInDb(order.id, accurateTotals);
    if (syncedOrder) order = syncedOrder;
  } catch (syncErr) {
    console.warn("Could not sync live shipping totals to whatsapp order:", syncErr);
  }

  const address = order.shippingAddress;
  const message = [
    `NEW ORDER #${order.id}`, "Store: MANBRO COUTURE", "",
    `Customer: ${address.firstName} ${address.lastName}`, `Phone: ${address.phone}`, `Email: ${address.email}`,
    `Address: ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`, address.notes ? `Notes: ${address.notes}` : "", "",
    ...order.items.map((item, i) => `${i + 1}. ${item.product.name} (${item.selectedSize}, ${item.selectedColor.name}) x${item.quantity} - ₹${(item.product.price * item.quantity).toFixed(2)}`),
    "", `Total: ₹${order.total.toFixed(2)} (Shipping: ₹${order.shipping}, Tax: ₹${order.tax})`,
    `Please confirm order #${order.id} and send payment instructions.`,
  ].join("\n");
  return { success: true, order, whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}` };
}

export async function lookupOrderAction(orderId: string, phone: string) {
  if (typeof orderId !== "string" || !/^ORD-[0-9A-F-]{36}$/i.test(orderId.trim()) || typeof phone !== "string" || !/^\d{8,15}$/.test(phone.replace(/\D/g, ""))) {
    return { success: false, error: "Enter the complete order reference and phone number used at checkout." };
  }
  try {
    const order = await getOrderByIdAndPhone(orderId, phone);
    return order ? { success: true, order } : { success: false, error: "No matching order found." };
  } catch {
    return { success: false, error: "Tracking is temporarily unavailable. Please try again." };
  }
}

export async function getAdminOrdersAction() {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  try { return { success: true, orders: await getAllOrdersDb() }; }
  catch { return { success: false, error: "Orders unavailable." }; }
}
export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  if (!orderStatusInput.safeParse(status).success) return { success: false };
  try { return { success: await updateOrderStatusDb(orderId, status) }; } catch { return { success: false }; }
}
export async function addIndiaPostTrackingAction(orderId: string, tracking: IndiaPostTracking) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  const parsed = trackingInput.safeParse(tracking);
  if (!parsed.success) return { success: false };
  try { return { success: await addIndiaPostTrackingDb(orderId, parsed.data) }; } catch { return { success: false }; }
}
export async function updateAdminNotesAction(orderId: string, notes: string) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  if (typeof notes !== "string" || notes.length > 10000) return { success: false };
  try { return { success: await updateAdminNotesDb(orderId, notes) }; } catch { return { success: false }; }
}
