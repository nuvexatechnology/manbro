"use server";

import { z } from "zod";
import type { CheckoutFormValues, CartItem, Order, OrderStatus, IndiaPostTracking } from "@/types/store";
import { checkoutInput, cartInput, orderStatusInput, trackingInput } from "@/lib/validators/store";
import { createOrderInDb, getOrderByIdAndPhone, getAllOrdersDb, updateOrderStatusDb, addIndiaPostTrackingDb, updateAdminNotesDb } from "@/lib/db/supabase";
import { isAdmin } from "@/lib/auth/admin";

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
  const address = order.shippingAddress;
  const message = [
    `NEW ORDER #${order.id}`, "Store: MANBRO COUTURE", "",
    `Customer: ${address.firstName} ${address.lastName}`, `Phone: ${address.phone}`, `Email: ${address.email}`,
    `Address: ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`, address.notes ? `Notes: ${address.notes}` : "", "",
    ...order.items.map((item, i) => `${i + 1}. ${item.product.name} (${item.selectedSize}, ${item.selectedColor.name}) x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}`),
    "", `Total: $${order.total.toFixed(2)} (Shipping: $${order.shipping}, Tax: $${order.tax})`,
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
