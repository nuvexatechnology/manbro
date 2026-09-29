"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Order, OrderStatus, Product, IndiaPostTracking } from "@/types/store";
import {
  getAdminOrdersAction,
  updateOrderStatusAction,
  addIndiaPostTrackingAction,
  updateAdminNotesAction,
} from "@/actions/order";
import { getProducts } from "@/lib/catalog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/auth/client";
import SalesReportSection from "@/components/admin/SalesReportSection";
import { generateOrderInvoicePdf } from "@/lib/generateInvoicePdf";
import { SiteAnnouncementSettings, DEFAULT_ANNOUNCEMENT_SETTINGS } from "@/types/settings";

const STATUS_LIST: OrderStatus[] = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "reports" | "products" | "users" | "announcements">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [announcements, setAnnouncements] = useState<SiteAnnouncementSettings>(DEFAULT_ANNOUNCEMENT_SETTINGS);
  const [isSavingAnnouncements, setIsSavingAnnouncements] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");

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

      // Session is confirmed valid, load data without kicking out on individual fetch errors
      try {
        const [catalog, ordersRes, usersRes, announcementsRes] = await Promise.allSettled([
          getProducts(),
          getAdminOrdersAction(),
          adminFetch("/api/admin/users").then(r => r.json()),
          adminFetch("/api/admin/settings/announcements").then(r => r.json()),
        ]);

        if (!isMounted) return;

        if (catalog.status === "fulfilled" && Array.isArray(catalog.value)) {
          setProducts(catalog.value);
        }
        if (ordersRes.status === "fulfilled" && ordersRes.value.success && ordersRes.value.orders) {
          setOrders(ordersRes.value.orders);
          if (ordersRes.value.orders.length > 0) {
            setSelectedOrder(ordersRes.value.orders[0]);
            setAdminNotesInput(ordersRes.value.orders[0].adminNotes || "");
          }
        }
        if (usersRes.status === "fulfilled" && usersRes.value.success && Array.isArray(usersRes.value.users)) {
          setUsers(usersRes.value.users);
        }
        if (announcementsRes.status === "fulfilled" && announcementsRes.value.success && announcementsRes.value.settings) {
          setAnnouncements(announcementsRes.value.settings);
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
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
    courierName: "India Post",
    trackingNumber: "",
    shippingDate: new Date().toISOString().split("T")[0],
    shippingCharge: 50,
  });

  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Logout failed");
      setIsAuthenticated(false);
      router.replace("/admin/login");
    } catch {
      alert("Logout failed. Please try again.");
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
        courierName: "India Post",
        trackingNumber: "",
        shippingDate: new Date().toISOString().split("T")[0],
        shippingCharge: 50,
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatusAction(orderId, newStatus);
    if (!result.success) {
      showFeedback("Status could not be updated. Cancelled orders cannot be reopened; shipped orders need a manual return.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showFeedback(`Status updated to ${newStatus}`);
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !trackingForm.trackingNumber.trim()) return;

    await addIndiaPostTrackingAction(selectedOrder.id, trackingForm);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, trackingInfo: trackingForm, status: o.status === "NEW" ? "SHIPPED" : o.status }
          : o
      )
    );
    if (selectedOrder) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, trackingInfo: trackingForm, status: prev.status === "NEW" ? "SHIPPED" : prev.status } : null
      );
    }
    showFeedback("India Post tracking details saved successfully!");
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedOrder) return;
    await updateAdminNotesAction(selectedOrder.id, adminNotesInput);
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, adminNotes: adminNotesInput } : o))
    );
    if (selectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, adminNotes: adminNotesInput } : null));
    }
    showFeedback("Admin notes saved!");
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#091D12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
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
                Order & Catalog Management
              </h1>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Manage customer orders, India Post shipping dispatches, and store inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#11301F] border border-[#284234] text-xs font-bold text-[#d4af37] hover:bg-[#284234]/50 transition"
            >
              📊 Full Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-[#11301F] border border-[#284234] text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Switcher & Feedback */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 bg-[#11301F] p-1.5 rounded-xl border border-[#284234]">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "orders" ? "bg-[#d4af37] text-black shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "reports" ? "bg-[#d4af37] text-black shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              📈 Sales Reports
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "products" ? "bg-[#d4af37] text-black shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "users" ? "bg-[#d4af37] text-black shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === "announcements" ? "bg-[#d4af37] text-black shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              📢 Header Banner
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-2.5 px-4 bg-[#11301F] border border-[#d4af37]/50 text-[#d4af37] text-xs font-semibold rounded-xl text-center animate-pulse">
              ✓ {feedbackMsg}
            </div>
          )}
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {["ALL", ...STATUS_LIST].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === status
                      ? "bg-[#d4af37] text-black font-extrabold"
                      : "bg-[#11301F] text-neutral-300 border border-[#284234] hover:text-white hover:border-[#d4af37]/40"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Orders List Cards */}
              <div className="lg:col-span-5 space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center bg-[#11301F] border border-[#284234] rounded-2xl text-xs text-neutral-400">
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
                            alert("Failed to generate PDF receipt");
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

                  {/* Items Summary */}
                  <div className="border-t border-[#284234] pt-4 space-y-2 text-xs">
                    <h4 className="font-bold text-white uppercase">Order Items</h4>
                    {selectedOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-neutral-300">
                        <span>{it.product.name} ({it.selectedSize}, {it.selectedColor.name}) x{it.quantity}</span>
                        <span className="font-bold text-white">{formatCurrency(it.product.price * it.quantity)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#284234] flex justify-between font-bold text-white text-sm">
                      <span>Total Amount</span>
                      <span className="text-[#d4af37]">{formatCurrency(selectedOrder.total)}</span>
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
        )}

        {/* Tab 2: Products & Inventory */}
        {activeTab === "products" && (
          <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#284234]">
              <div>
                <h3 className="text-lg font-bold text-white">Product Catalog Management</h3>
                <p className="text-xs text-neutral-400">View catalog inventory or add and configure new products with variants.</p>
              </div>
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                + Add / Manage Products in Dashboard ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-[#091D12] border border-[#284234] rounded-xl p-4 flex gap-4 items-center">
                  <div className="relative w-16 h-20 rounded-lg bg-[#11301F] overflow-hidden shrink-0 border border-[#284234]">
                    <Image src={prod.images[0] || "/images/products/tshirt-burgundy.jpg"} alt={prod.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-[#d4af37] uppercase">{prod.category}</span>
                      {prod.productCode && (
                        <span className="text-[9px] font-mono text-neutral-400">{prod.productCode}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white line-clamp-1">{prod.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{formatCurrency(prod.price)}</span>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded">In Stock</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Sales Reports */}
        {activeTab === "reports" && (
          <SalesReportSection orders={orders} />
        )}

        {/* Tab 4: Users */}
        {activeTab === "users" && (() => {
          const query = userSearch.trim().toLowerCase();
          const filteredUsers = users.filter((u) => {
            if (!query) return true;
            const name = (u.name || "").toLowerCase();
            const phone = (u.phone || "").toLowerCase();
            const id = (u.id || "").toLowerCase();
            return name.includes(query) || phone.includes(query) || id.includes(query);
          });

          return (
            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#284234]">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">Registered Customers</h3>
                  <p className="text-xs text-neutral-400">Customers registered with Mobile Number & Name.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search name, phone, or ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-[#091D12] border border-[#284234] focus:border-[#d4af37] text-white placeholder-neutral-500 text-xs px-3.5 py-2 rounded-xl outline-none transition"
                    />
                    {userSearch && (
                      <button
                        type="button"
                        onClick={() => setUserSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="px-3.5 py-2 bg-[#091D12] border border-[#284234] rounded-xl text-xs font-bold text-[#d4af37] text-center shrink-0">
                    {filteredUsers.length} / {users.length}
                  </div>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-white">No registered customers yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Customers who sign up on the storefront will be listed here.</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-white">No customers found matching &quot;{userSearch}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setUserSearch("")}
                    className="mt-3 text-xs text-[#d4af37] hover:underline font-semibold"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#284234] text-neutral-400 uppercase tracking-wider font-bold text-[11px]">
                        <th className="pb-3 px-3">Customer Name</th>
                        <th className="pb-3 px-3">Mobile Number</th>
                        <th className="pb-3 px-3">Joined Date</th>
                        <th className="pb-3 px-3">Last Active</th>
                        <th className="pb-3 px-3 text-right">Orders Placed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#284234]">
                      {filteredUsers.map((u) => {
                        const userOrders = orders.filter(
                          (o) => o.shippingAddress?.phone?.replace(/\D/g, "") === u.phone?.replace(/\D/g, "")
                        );
                        return (
                          <tr key={u.id} className="hover:bg-[#091D12]/60 transition">
                            <td className="py-4 px-3">
                              <div className="font-bold text-white text-sm">{u.name}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">{u.id}</div>
                            </td>
                            <td className="py-4 px-3 font-semibold text-[#d4af37]">
                              📱 {u.phone || "—"}
                            </td>
                            <td className="py-4 px-3 text-neutral-300">
                              {u.createdAt ? formatDate(u.createdAt) : "—"}
                            </td>
                            <td className="py-4 px-3 text-neutral-400">
                              {u.lastSignInAt ? formatDate(u.lastSignInAt) : "—"}
                            </td>
                            <td className="py-4 px-3 text-right">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  userOrders.length > 0
                                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                                    : "bg-[#091D12] text-neutral-400 border border-[#284234]"
                                }`}
                              >
                                {userOrders.length} Order{userOrders.length === 1 ? "" : "s"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 5: Header Announcements */}
        {activeTab === "announcements" && (
          <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#284234]">
              <div>
                <h3 className="text-lg font-bold text-white uppercase">Header Announcement Bar</h3>
                <p className="text-xs text-neutral-400">Configure promotional offers and free delivery text shown at the top of every storefront page.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  announcements.isEnabled
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
                    : "bg-red-950/80 text-red-400 border-red-800/50"
                }`}>
                  {announcements.isEnabled ? "Banner Active" : "Banner Hidden"}
                </span>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">Live Preview on Storefront Header</label>
              <div className="bg-[#091D12] border border-[#284234] rounded-xl py-3 px-4 flex items-center justify-between text-xs tracking-wide">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  {announcements.freeShippingText && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#d4af37]">🚚</span>
                      <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                        {announcements.freeShippingText}
                      </span>
                    </div>
                  )}
                  {(announcements.offerText || announcements.offerCode) && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#d4af37]">🏷️</span>
                      <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                        {announcements.offerText}{" "}
                        {announcements.offerCode && (
                          <span className="text-[#d4af37] font-black">{announcements.offerCode}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono hidden md:block">
                  TRACK ORDER / SIGN IN
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingAnnouncements(true);
                try {
                  const res = await adminFetch("/api/admin/settings/announcements", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(announcements),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setAnnouncements(data.settings);
                    showFeedback("Header announcement banner updated successfully!");
                  } else {
                    alert(data.error || "Failed to update announcements");
                  }
                } catch {
                  alert("Error saving announcement settings.");
                } finally {
                  setIsSavingAnnouncements(false);
                }
              }}
              className="space-y-5"
            >
              {/* Enable/Disable Toggle */}
              <div className="flex items-center gap-3 p-4 bg-[#091D12] border border-[#284234] rounded-xl">
                <input
                  type="checkbox"
                  id="enableBanner"
                  checked={announcements.isEnabled}
                  onChange={(e) => setAnnouncements({ ...announcements, isEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                />
                <label htmlFor="enableBanner" className="text-xs font-bold text-white cursor-pointer select-none">
                  Display Announcement Bar on Storefront
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Free Shipping text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">
                    Free Delivery / Left Label
                  </label>
                  <input
                    type="text"
                    value={announcements.freeShippingText}
                    onChange={(e) => setAnnouncements({ ...announcements, freeShippingText: e.target.value })}
                    placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹999"
                    className="w-full bg-[#091D12] border border-[#284234] focus:border-[#d4af37] text-white text-xs px-4 py-2.5 rounded-xl outline-none"
                  />
                  <p className="text-[11px] text-neutral-500">Left announcement label in the top bar.</p>
                </div>

                {/* Offer Description Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">
                    Offer / Right Label
                  </label>
                  <input
                    type="text"
                    value={announcements.offerText}
                    onChange={(e) => setAnnouncements({ ...announcements, offerText: e.target.value, offerCode: "" })}
                    placeholder="e.g. 10% OFF YOUR FIRST ORDER"
                    className="w-full bg-[#091D12] border border-[#284234] focus:border-[#d4af37] text-white text-xs px-4 py-2.5 rounded-xl outline-none"
                  />
                  <p className="text-[11px] text-neutral-500">Secondary / offer announcement label in the top bar.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#284234] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAnnouncements(DEFAULT_ANNOUNCEMENT_SETTINGS)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  ↺ Reset to Default
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnnouncements}
                  className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-[#d4af37]/20"
                >
                  {isSavingAnnouncements ? "Saving..." : "Save Announcement Settings"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
