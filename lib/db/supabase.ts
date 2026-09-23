import "server-only";
import type { CheckoutFormValues, CustomerOrder, Order, OrderStatus, IndiaPostTracking } from "@/types/store";
import { getDb } from "./client";
import { requireAdmin } from "@/lib/auth/admin";

export async function createOrderInDb(address: CheckoutFormValues, items: { productId: string; size: string; color: string; quantity: number }[], requestId: string): Promise<Order> {
  const { data, error } = await getDb().rpc("manbro_create_order", { p_address: address, p_items: items, p_request_id: requestId });
  if (error) throw new Error(error.code === "P0001" ? "One or more items are unavailable or this request has changed. Review your bag and try again." : "Order storage is unavailable. Please retry with the same details.");
  return data as Order;
}

export async function getOrderByIdAndPhone(orderId: string, phone: string): Promise<CustomerOrder | null> {
  const cleanPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  if (!/^\d{8,15}$/.test(cleanPhone)) return null;
  const { data, error } = await getDb().from("manbro_orders").select("data").eq("id", orderId.trim().toUpperCase()).eq("phone", cleanPhone).maybeSingle();
  if (error) throw new Error("Order lookup unavailable.");
  if (!data) return null;
  const order = data.data as Order;
  return { id: order.id, createdAt: order.createdAt, items: order.items, subtotal: order.subtotal, discount: order.discount, shipping: order.shipping, tax: order.tax, total: order.total, status: order.status, trackingInfo: order.trackingInfo };
}

export async function getAllOrdersDb(): Promise<Order[]> {
  await requireAdmin();
  const { data, error } = await getDb().from("manbro_orders").select("data").order("created_at", { ascending: false });
  if (error) throw new Error("Orders unavailable.");
  return data.map(row => row.data as Order);
}

async function updateOrder(orderId: string, patch: object): Promise<boolean> {
  await requireAdmin();
  const { data, error } = await getDb().rpc("manbro_update_order", { p_id: orderId, p_patch: patch });
  if (error) throw new Error("Unable to update order.");
  return data === true;
}
export async function updateOrderStatusDb(orderId: string, status: OrderStatus) { return updateOrder(orderId, { status }); }
export async function addIndiaPostTrackingDb(orderId: string, tracking: IndiaPostTracking) { return updateOrder(orderId, { trackingInfo: tracking }); }
export async function updateAdminNotesDb(orderId: string, notes: string) { return updateOrder(orderId, { adminNotes: notes }); }
