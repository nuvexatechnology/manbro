"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Order, OrderStatus, IndiaPostTracking } from "@/types/store";
import {
  getAdminOrdersAction,
  updateOrderStatusAction,
  addIndiaPostTrackingAction,
  updateAdminNotesAction,
} from "@/actions/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateOrderInvoicePdf } from "@/lib/generateInvoicePdf";
import { toast } from "@/components/ui/toast";

const STATUS_LIST: OrderStatus[] = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrderDeskPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    const checkSessionAndLoad = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!isMounted) return;
        if (!response.ok || data.authenticated !== true) {
          router.replace("/admin/login");
          return;
        }
        setIsAuthenticated(true);
      } catch {
        if (isMounted) router.replace("/admin/login");
        return;
      }

      try {
        const ordersRes = await getAdminOrdersAction();
        if (!isMounted) return;

        if (ordersRes.success && ordersRes.orders) {
          setOrders(ordersRes.orders);
          if (ordersRes.orders.length > 0) {
            setSelectedOrder(ordersRes.orders[0]);
            setAdminNotesInput(ordersRes.orders[0].adminNotes || "");
          }
        }
      } catch (err) {
        console.error("Error loading admin orders:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void checkSessionAndLoad();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // India Post Tracking Form state
  const [trackingForm, setTrackingForm] = useState<IndiaPostTracking>({
    courierName: "India Post Speed Post",
    trackingNumber: "",
    shippingDate: new Date().toISOString().split("T")[0],
    shippingCharge: 0,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Logout failed");
      setIsAuthenticated(false);
      router.replace("/admin/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const handleSelectOrder = (o: Order) => {
    setSelectedOrder(o);
    setAdminNotesInput(o.adminNotes || "");
    if (o.trackingInfo) {
      setTrackingForm(o.trackingInfo);
    } else {
      setTrackingForm({
        courierName: "India Post Speed Post",
        trackingNumber: "",
        shippingDate: new Date().toISOString().split("T")[0],
        shippingCharge: 0,
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
      showFeedback(`Order #${orderId} marked as ${newStatus}`);
      toast.success(`Order #${orderId} marked as ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update order status");
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!trackingForm.trackingNumber) {
      toast.warning("Please enter India Post tracking number");
      return;
    }

    const res = await addIndiaPostTrackingAction(selectedOrder.id, trackingForm);
    if (res.success) {
      const savedTracking = trackingForm;
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, trackingInfo: savedTracking } : o)));
      setSelectedOrder((prev) => (prev ? { ...prev, trackingInfo: savedTracking } : prev));
      showFeedback("India Post tracking saved and customer notified!");
      toast.success("India Post tracking saved and customer notified!");
    } else {
      toast.error(res.error || "Failed to save tracking");
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedOrder) return;
    const res = await updateAdminNotesAction(selectedOrder.id, adminNotesInput);
    if (res.success) {
      const savedNotes = adminNotesInput;
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, adminNotes: savedNotes } : o)));
      setSelectedOrder((prev) => (prev ? { ...prev, adminNotes: savedNotes } : prev));
      showFeedback("Internal admin note saved.");
      toast.success("Internal admin note saved.");
    } else {
      toast.error(res.error || "Failed to save notes");
    }
  };

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#091D12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-neutral-400">Loading Order Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#091D12] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#284234] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src="/images/logo-mark.png"
                  alt="MANBRO Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Order Desk & India Post Dispatch
              </h1>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Review customer orders, update order statuses, generate receipts, and manage India Post shipments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-[#11301F] border border-[#284234] hover:border-[#d4af37] text-xs font-bold text-[#d4af37] hover:bg-[#284234]/50 transition flex items-center gap-1.5 shadow"
            >
              📊 Full Admin Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#11301F] border border-[#284234] text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feedback alert banner if any */}
        {feedbackMsg && (
          <div className="p-3 px-4 bg-[#11301F] border border-[#d4af37]/50 text-[#d4af37] text-xs font-semibold rounded-xl text-center">
            ✓ {feedbackMsg}
          </div>
        )}

        {/* Orders Desk Main View */}
        <div className="space-y-6">
          {/* Status Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {["ALL", ...STATUS_LIST].map((status) => {
                const count = status === "ALL" ? orders.length : orders.filter(o => o.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === status
                        ? "bg-[#d4af37] text-black font-extrabold shadow-lg shadow-[#d4af37]/20"
                        : "bg-[#11301F] text-neutral-300 border border-[#284234] hover:text-white hover:border-[#d4af37]/40"
                    }`}
                  >
                    <span>{status}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === status ? "bg-black/20 text-black font-black" : "bg-[#091D12] text-neutral-400"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="text-xs text-neutral-400 font-medium">
              Showing <strong className="text-white">{filteredOrders.length}</strong> of {orders.length} orders
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Orders List Cards */}
            <div className="lg:col-span-5 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#11301F] border border-[#284234] rounded-2xl text-xs text-neutral-400">
                  No orders match current filter.
                </div>
              ) : (
                filteredOrders.map((orderItem) => {
                  const isSelected = selectedOrder?.id === orderItem.id;
                  return (
                    <div
                      key={orderItem.id}
                      onClick={() => handleSelectOrder(orderItem)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "bg-[#11301F] border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-xl"
                          : "bg-[#11301F]/70 border-[#284234] hover:border-[#284234]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#d4af37]">{orderItem.id}</h4>
                          <p className="text-xs text-neutral-300">
                            {orderItem.shippingAddress.firstName} {orderItem.shippingAddress.lastName}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                            orderItem.status === "DELIVERED"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                              : orderItem.status === "SHIPPED"
                              ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                              : orderItem.status === "CANCELLED"
                              ? "bg-red-950/80 text-red-400 border-red-800/60"
                              : "bg-amber-950/80 text-[#d4af37] border-amber-800/60"
                          }`}
                        >
                          {orderItem.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <span>{formatDate(orderItem.createdAt)}</span>
                        <strong className="text-white font-bold">{formatCurrency(orderItem.total)}</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Order Detail Drawer */}
            {selectedOrder ? (
              <div className="lg:col-span-7 bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#284234] pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      Order <span className="text-[#d4af37]">#{selectedOrder.id}</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Placed on {formatDate(selectedOrder.createdAt)}</p>
                  </div>

                  {/* Customer Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await generateOrderInvoicePdf(selectedOrder);
                        } catch (err) {
                          toast.error("Failed to generate PDF receipt");
                        }
                      }}
                      className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs rounded-lg transition flex items-center gap-1.5 shadow cursor-pointer"
                      title="Download Unique PDF with embedded QR Code"
                    >
                      📄 Download PDF
                    </button>
                    <a
                      href={`https://wa.me/${selectedOrder.shippingAddress.phone.replaceAll(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow"
                    >
                      💬 WhatsApp
                    </a>
                    <a
                      href={`tel:${selectedOrder.shippingAddress.phone}`}
                      className="px-3 py-1.5 bg-[#091D12] border border-[#284234] hover:border-[#d4af37]/50 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      📞 Call
                    </a>
                  </div>
                </div>

                {/* Status Dropdown Controls */}
                <div className="bg-[#091D12] p-4 rounded-xl border border-[#284234] flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-neutral-300">
                    Order Status Pipeline:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className="bg-[#11301F] border border-[#284234] text-[#d4af37] text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#091D12] p-4 rounded-xl border border-[#284234]">
                  <div>
                    <span className="text-neutral-400 block font-semibold">Customer Name</span>
                    <span className="text-white font-bold">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-semibold">Phone Number</span>
                    <span className="text-white font-mono">{selectedOrder.shippingAddress.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-400 block font-semibold">Shipping Address</span>
                    <span className="text-white">
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </span>
                  </div>
                  {selectedOrder.shippingAddress.notes && (
                    <div className="sm:col-span-2 pt-2 border-t border-[#284234] text-neutral-300">
                      <strong className="text-[#d4af37]">Customer Notes:</strong> {selectedOrder.shippingAddress.notes}
                    </div>
                  )}
                </div>

                {/* India Post Tracking Entry Form */}
                <form onSubmit={handleSaveTracking} className="bg-[#091D12] p-5 rounded-xl border border-[#284234] space-y-4">
                  <h4 className="text-xs font-extrabold uppercase text-[#d4af37] flex items-center gap-2">
                    📦 India Post Tracking Entry
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-300 block mb-1">Courier Name</label>
                      <input
                        type="text"
                        value={trackingForm.courierName}
                        onChange={(e) => setTrackingForm((p) => ({ ...p, courierName: e.target.value }))}
                        className="w-full bg-[#11301F] border border-[#284234] rounded-lg px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block mb-1">Tracking Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. EM123456789IN"
                        value={trackingForm.trackingNumber}
                        onChange={(e) => setTrackingForm((p) => ({ ...p, trackingNumber: e.target.value }))}
                        className="w-full bg-[#11301F] border border-[#284234] rounded-lg px-3 py-2 text-white font-mono uppercase focus:border-[#d4af37] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block mb-1">Shipping Date</label>
                      <input
                        type="date"
                        value={trackingForm.shippingDate}
                        onChange={(e) => setTrackingForm((p) => ({ ...p, shippingDate: e.target.value }))}
                        className="w-full bg-[#11301F] border border-[#284234] rounded-lg px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block mb-1">Shipping Charge (₹)</label>
                      <input
                        type="number"
                        value={trackingForm.shippingCharge}
                        onChange={(e) => setTrackingForm((p) => ({ ...p, shippingCharge: Number(e.target.value) }))}
                        className="w-full bg-[#11301F] border border-[#284234] rounded-lg px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                  >
                    Save India Post Details & Mark Shipped
                  </button>
                </form>

                {/* Admin Internal Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-neutral-300 block">
                    Admin Internal Notes
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      placeholder="Add admin notes (e.g. customer requested morning dispatch)..."
                      className="w-full bg-[#091D12] border border-[#284234] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAdminNotes}
                      className="px-4 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Items Summary & Financial Breakdown */}
                <div className="border-t border-[#284234] pt-4 space-y-2 text-xs">
                  <h4 className="font-bold text-white uppercase">Order Items</h4>
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-neutral-300">
                      <span>{it.product.name} ({it.selectedSize}, {it.selectedColor.name}) x{it.quantity}</span>
                      <span className="font-bold text-white">{formatCurrency(it.product.price * it.quantity)}</span>
                    </div>
                  ))}
                  
                  <div className="pt-2 border-t border-[#284234] space-y-1 text-neutral-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping / Delivery</span>
                      <span className="text-white">{selectedOrder.shipping === 0 ? "FREE" : formatCurrency(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="text-white">{formatCurrency(selectedOrder.tax || Math.round(selectedOrder.subtotal * 0.05 * 100) / 100)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-[#284234] flex justify-between font-bold text-white text-sm">
                      <span>Total Paid</span>
                      <span className="text-[#d4af37]">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 bg-[#11301F] border border-[#284234] rounded-2xl p-12 text-center text-xs text-neutral-400">
                Select an order from the left list to view details and manage shipping.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
