"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/components/auth/user-auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerOrder, OrderStatus } from "@/types/store";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  NEW: { label: "Order Placed", color: "text-sky-300", bg: "bg-sky-900/30", border: "border-sky-500/40", icon: "🛒" },
  CONFIRMED: { label: "Confirmed", color: "text-emerald-300", bg: "bg-emerald-900/30", border: "border-emerald-500/40", icon: "✅" },
  PROCESSING: { label: "Processing", color: "text-amber-300", bg: "bg-amber-900/30", border: "border-amber-500/40", icon: "⚙️" },
  SHIPPED: { label: "Shipped", color: "text-purple-300", bg: "bg-purple-900/30", border: "border-purple-500/40", icon: "🚚" },
  DELIVERED: { label: "Delivered", color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "border-[#d4af37]/40", icon: "🎉" },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-900/30", border: "border-red-500/40", icon: "❌" },
};

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "NEW", label: "Order Placed", desc: "Received by store" },
  { status: "CONFIRMED", label: "Confirmed", desc: "Store confirmed order" },
  { status: "PROCESSING", label: "Processing", desc: "Packing & quality inspection" },
  { status: "SHIPPED", label: "Shipped", desc: "Dispatched via courier" },
  { status: "DELIVERED", label: "Delivered", desc: "Package delivered to you" },
];

function getStepState(step: OrderStatus, current: OrderStatus): "completed" | "current" | "upcoming" | "cancelled" {
  if (current === "CANCELLED") return "cancelled";
  const order: OrderStatus[] = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const ci = order.indexOf(current);
  const si = order.indexOf(step);
  if (si < ci) return "completed";
  if (si === ci) return "current";
  return "upcoming";
}

function OrderDetailModal({ order, onClose }: { order: CustomerOrder; onClose: () => void }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.NEW;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0D2417] border border-[#284234] rounded-2xl shadow-2xl z-10 mt-6 mb-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#284234] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-black text-white">Order Details</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#284234]/50 text-neutral-400 hover:text-white transition" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#091D12] border border-[#284234] rounded-xl p-3 space-y-1">
              <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">Date Placed</span>
              <p className="text-white font-semibold">{formatDate(order.createdAt)}</p>
            </div>
            <div className="bg-[#091D12] border border-[#284234] rounded-xl p-3 space-y-1">
              <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">Total Paid</span>
              <p className="text-[#d4af37] font-black text-sm">{formatCurrency(order.total)}</p>
            </div>
          </div>

          {/* Tracking info */}
          {order.trackingInfo ? (
            <div className="bg-[#091D12] border border-[#d4af37]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[#d4af37] flex items-center gap-1.5">
                  📦 {order.trackingInfo.courierName} Tracking
                </span>
                <span className="text-[11px] text-neutral-400">Shipped: {order.trackingInfo.shippingDate}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Tracking No.</span>
                  <strong className="text-white font-mono text-sm tracking-wider">{order.trackingInfo.trackingNumber}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Shipping Charge</span>
                  <strong className="text-white">{formatCurrency(order.trackingInfo.shippingCharge)}</strong>
                </div>
              </div>
              <a href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline font-semibold">
                Track on India Post Portal →
              </a>
            </div>
          ) : (
            <div className="bg-[#091D12]/60 border border-[#284234] rounded-xl p-3 text-xs text-neutral-500 text-center">
              Tracking details will appear once your order is dispatched.
            </div>
          )}

          {/* Timeline */}
          {order.status !== "CANCELLED" && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Delivery Progress</h3>
              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#284234]">
                {STATUS_STEPS.map((step) => {
                  const state = getStepState(step.status, order.status);
                  return (
                    <div key={step.status} className="relative flex items-start gap-3">
                      <span className={`absolute -left-7 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        state === "completed" ? "bg-[#d4af37] border-[#d4af37] text-black"
                        : state === "current" ? "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] ring-4 ring-[#d4af37]/10 animate-pulse"
                        : "bg-[#11301F] border-[#284234] text-neutral-600"
                      }`}>
                        {state === "completed" ? "✓" : ""}
                      </span>
                      <div>
                        <h4 className={`text-xs font-bold ${state === "current" ? "text-[#d4af37]" : state === "completed" ? "text-white" : "text-neutral-500"}`}>
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center text-xs text-red-400 font-semibold">
              ❌ This order has been cancelled. Contact us via WhatsApp for help.
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Items Ordered ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                const variant = item.product?.variants?.find(
                  (v) => v.size === item.selectedSize && v.color.name === item.selectedColor.name
                );
                const price = variant?.price ?? item.product?.price ?? 0;
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-[#091D12] border border-[#284234] rounded-xl p-3">
                    {item.product && (
                      <div className="relative w-14 h-16 rounded-lg bg-[#082816] overflow-hidden shrink-0 border border-[#284234]">
                        <Image
                          src={(item.selectedColor && item.product.colorImages?.[item.selectedColor.name]) || item.product.images?.[0] || "/images/products/tshirt-burgundy.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.product?.name ?? "Product"}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                        <span>Size: <strong className="text-white">{item.selectedSize}</strong></span>
                        <span className="text-neutral-600">•</span>
                        <span className="flex items-center gap-1">
                          Color:
                          <span className="w-2.5 h-2.5 rounded-full border border-neutral-600" style={{ backgroundColor: item.selectedColor.hex }} />
                          <strong className="text-white">{item.selectedColor.name}</strong>
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37] shrink-0">{formatCurrency(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-[#091D12] border border-[#284234] rounded-xl p-4 space-y-2 text-xs">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Price Breakdown</h3>
            <div className="flex justify-between text-neutral-300"><span>Subtotal</span><span className="text-white">{formatCurrency(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>− {formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between text-neutral-300">
              <span>Shipping</span>
              <span className={order.shipping === 0 ? "text-[#d4af37] font-bold" : "text-white"}>{order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-neutral-300"><span>GST (5%)</span><span className="text-white">{formatCurrency(order.tax)}</span></div>
            <div className="flex justify-between font-black text-white text-sm pt-2 border-t border-[#284234]">
              <span>Total</span><span className="text-[#d4af37]">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link href={`/track?orderId=${encodeURIComponent(order.id)}`} className="flex-1 py-2.5 text-center text-xs font-black bg-[#d4af37] text-black rounded-xl hover:bg-[#c29e2e] transition">
              Track this Order
            </Link>
            <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-neutral-300 bg-[#11301F] border border-[#284234] rounded-xl hover:text-white hover:border-neutral-500 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, logout, openLoginModal } = useUserAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");

  const fetchOrders = useCallback(async () => {
    setIsFetchingOrders(true);
    setFetchError("");
    try {
      const res = await fetch("/api/user/orders", { credentials: "same-origin", cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders ?? []);
      } else {
        setFetchError(data.error || "Failed to load orders.");
      }
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setIsFetchingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      openLoginModal();
    }
    if (user) {
      void fetchOrders();
    }
  }, [isLoading, user, openLoginModal, fetchOrders]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-[#11301F]/60 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-[#11301F] border border-[#284234] flex items-center justify-center mx-auto text-3xl">👤</div>
        <h1 className="text-2xl font-black text-white">Sign In to View Your Profile</h1>
        <p className="text-sm text-neutral-400">Access your order history, tracking, and account details.</p>
        <button onClick={openLoginModal} className="px-8 py-3 bg-[#d4af37] text-black font-black text-sm rounded-xl hover:bg-[#c29e2e] transition">
          Sign In
        </button>
      </div>
    );
  }

  const statusFilterOptions: ("all" | OrderStatus)[] = ["all", "NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filteredOrders = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
  const totalSpend = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0);
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb */}
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-[#d4af37] bg-[#11301F] border border-[#284234] px-3.5 py-1 rounded-full">
            My Account
          </span>
        </div>

        {/* Profile Card */}
        <div className="bg-[#11301F] border border-[#284234] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#d4af37]/5 rounded-full pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border-2 border-[#d4af37]/40 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-[#d4af37]">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {user.phone}
                </span>
                {user.email && !user.email.includes("@manbro.user") && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="px-5 py-2.5 text-xs font-bold text-red-400 border border-red-500/40 bg-red-900/20 rounded-xl hover:bg-red-900/40 hover:text-red-300 transition shrink-0"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: orders.length, icon: "📦", color: "text-sky-300" },
            { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, icon: "🎉", color: "text-[#d4af37]" },
            { label: "In Progress", value: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length, icon: "🚚", color: "text-emerald-300" },
            { label: "Total Spent", value: formatCurrency(totalSpend), icon: "💎", color: "text-[#d4af37]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#11301F] border border-[#284234] rounded-2xl p-4 space-y-1">
              <span className="text-2xl">{stat.icon}</span>
              <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div className="bg-[#11301F] border border-[#284234] rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#284234] flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Order History</h2>
            <button onClick={fetchOrders} disabled={isFetchingOrders} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-[#284234] hover:border-neutral-500 rounded-lg px-3 py-1.5 transition disabled:opacity-50">
              <svg className={`w-3.5 h-3.5 ${isFetchingOrders ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {orders.length > 0 && (
            <div className="px-6 py-3 border-b border-[#284234] overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {statusFilterOptions.map((tab) => {
                  const cfg = tab !== "all" ? STATUS_CONFIG[tab as OrderStatus] : null;
                  const count = tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length;
                  if (count === 0 && tab !== "all") return null;
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition whitespace-nowrap ${activeTab === tab ? "bg-[#d4af37] text-black" : "text-neutral-400 hover:text-white bg-[#091D12] border border-[#284234] hover:border-neutral-500"}`}>
                      {cfg ? `${cfg.icon} ` : ""}{tab === "all" ? "All" : STATUS_CONFIG[tab as OrderStatus].label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="divide-y divide-[#284234]">
            {isFetchingOrders ? (
              <div className="p-10 space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#091D12]/60 rounded-xl animate-pulse" />)}
              </div>
            ) : fetchError ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-red-400 text-sm font-medium">{fetchError}</p>
                <button onClick={fetchOrders} className="px-5 py-2 bg-[#d4af37] text-black text-xs font-black rounded-xl">Retry</button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#091D12] border border-[#284234] flex items-center justify-center mx-auto text-2xl">📭</div>
                <p className="text-white font-bold text-base">
                  {activeTab === "all" ? "No Orders Yet" : `No ${STATUS_CONFIG[activeTab as OrderStatus]?.label ?? activeTab} Orders`}
                </p>
                <p className="text-neutral-400 text-xs max-w-xs mx-auto">
                  {activeTab === "all" ? "Start shopping and your orders will appear here." : "Try a different filter to see other orders."}
                </p>
                {activeTab === "all" && (
                  <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#d4af37] text-black text-xs font-black rounded-xl hover:bg-[#c29e2e] transition">
                    Shop Collection
                  </Link>
                )}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.NEW;
                return (
                  <div key={order.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[#091D12]/40 transition group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base border ${cfg.bg} ${cfg.border}`}>{cfg.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-white font-bold">{order.id}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[11px] text-neutral-400">
                          <span>📅 {formatDate(order.createdAt)}</span>
                          <span>🛍️ {order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                          {order.trackingInfo && <span className="text-purple-300">📦 {order.trackingInfo.trackingNumber}</span>}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1 truncate">
                          {order.items.map((i) => i.product?.name).filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                      <span className="text-base font-black text-[#d4af37]">{formatCurrency(order.total)}</span>
                      <button className="text-xs font-bold text-neutral-300 group-hover:text-white border border-[#284234] group-hover:border-neutral-500 px-3 py-1.5 rounded-lg transition flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                        View Details
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📦", title: "Track an Order", desc: "Enter order ID to track via India Post", href: "/track" },
            { icon: "🛍️", title: "Shop Collection", desc: "Browse our latest luxury streetwear", href: "/shop" },
            { icon: "📞", title: "Contact Us", desc: "Reach out via WhatsApp for support", href: "/contact" },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="bg-[#11301F] border border-[#284234] rounded-2xl p-5 hover:border-[#d4af37]/40 hover:bg-[#11301F]/80 transition group">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="mt-3 text-sm font-bold text-white group-hover:text-[#d4af37] transition">{card.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

