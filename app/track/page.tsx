"use client";

import React, { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerOrder, OrderStatus } from "@/types/store";
import { lookupOrderAction } from "@/actions/order";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "NEW", label: "Order Placed", desc: "Received via WhatsApp / Web" },
  { status: "CONFIRMED", label: "Confirmed", desc: "Store confirmed order details" },
  { status: "PROCESSING", label: "Processing", desc: "Packing & quality inspection" },
  { status: "SHIPPED", label: "Shipped", desc: "Handed over to India Post" },
  { status: "DELIVERED", label: "Delivered", desc: "Package delivered to recipient" },
];

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-400 text-sm">Loading order tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  return <TrackOrderForm key={initialOrderId} initialOrderId={initialOrderId} />;
}

function TrackOrderForm({ initialOrderId }: { initialOrderId: string }) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const searching = useRef(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searching.current) return;
    setOrder(null);
    if (!orderIdInput.trim() || !/^\d{8,15}$/.test(phoneInput.replace(/\D/g, ""))) {
      setErrorMessage("Enter your order ID and the full phone number used at checkout, including country code if supplied.");
      return;
    }

    searching.current = true;
    setIsLoading(true);
    setErrorMessage("");
    setOrder(null);

    try {
      const res = await lookupOrderAction(orderIdInput.trim(), phoneInput.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setErrorMessage(res.error || "Order not found. Check your order ID and full phone number, then try again.");
      }
    } catch {
      setErrorMessage("Order tracking is unavailable right now. Please try again.");
    } finally {
      searching.current = false;
      setIsLoading(false);
    }
  };

  const getStepStatus = (stepStatus: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === "CANCELLED") return "cancelled";
    const statusOrder: OrderStatus[] = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border border-[#284234] px-3 py-1 rounded-full bg-[#11301F]">
          India Post & Store Courier Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs text-neutral-400">
          Enter the complete order reference from your confirmation and the full phone number used at checkout. No login required.
        </p>
      </div>

      {/* Lookup Card Form */}
      <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <fieldset disabled={isLoading} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tracking-order-id" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Order ID *
              </label>
              <input
                id="tracking-order-id"
                type="text"
                placeholder="ORD- followed by your full reference"
                value={orderIdInput}
                onChange={(e) => { setOrderIdInput(e.target.value); setErrorMessage(""); setOrder(null); }}
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white uppercase focus:outline-none focus:border-[#d4af37] transition"
                required
              />
            </div>
            <div>
              <label htmlFor="tracking-phone" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Full Phone Number *
              </label>
              <input
                id="tracking-phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="Phone used at checkout"
                value={phoneInput}
                onChange={(e) => { setPhoneInput(e.target.value); setErrorMessage(""); setOrder(null); }}
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
              />
            </div>
          </fieldset>

          {errorMessage && (
            <div role="alert" className="p-3 rounded-lg bg-white/10 border border-white/30 text-white text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#d4af37] text-black font-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] active:scale-[0.98] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Searching Orders..." : errorMessage ? "Retry Tracking" : "Track Package Status"}
          </button>
        </form>
      </div>

      {/* Order Status Result */}
      {order && (
        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#284234] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{order.id}</h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                    order.status === "DELIVERED"
                      ? "bg-white/20 text-white border-white/40"
                      : order.status === "SHIPPED"
                      ? "bg-white/20 text-white border-white/40"
                      : order.status === "CANCELLED"
                      ? "bg-white/20 text-white border-white/40"
                      : "bg-white/20 text-white border-white/40"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Placed on {formatDate(order.createdAt)} • {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-neutral-400 block">Total Amount</span>
              <span className="text-xl font-bold text-white">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* India Post Courier Details Card */}
          {order.trackingInfo ? (
            <div className="bg-[#091D12] border border-white/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-white flex items-center gap-1.5">
                  📦 {order.trackingInfo.courierName} Shipment Details
                </span>
                <span className="text-[11px] text-neutral-400">Shipped: {order.trackingInfo.shippingDate}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-neutral-400 block">Tracking Number</span>
                  <strong className="text-white font-mono text-sm tracking-wider">{order.trackingInfo.trackingNumber}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Shipping Charge</span>
                  <strong className="text-white">{formatCurrency(order.trackingInfo.shippingCharge)}</strong>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:text-gray-300 underline font-semibold"
                >
                  Track on Official India Post Portal →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#091D12]/60 border border-[#284234] rounded-xl p-4 text-xs text-neutral-400 text-center">
              India Post tracking number will be assigned once package is dispatched by store.
            </div>
          )}

          {/* Status Timeline */}
          {order.status !== "CANCELLED" ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Delivery Progress
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#284234]">
                {STATUS_STEPS.map((step) => {
                  const state = getStepStatus(step.status, order.status);
                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Node Bullet */}
                      <span
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          state === "completed"
                            ? "bg-white border-white text-black"
                            : state === "current"
                            ? "bg-white border-white text-black ring-4 ring-white/20 animate-pulse"
                            : "bg-[#11301F] border-[#284234] text-neutral-600"
                        }`}
                      >
                        {state === "completed" ? "✓" : ""}
                      </span>

                      <div>
                        <h4
                          className={`text-sm font-bold ${
                            state === "current"
                              ? "text-white"
                              : state === "completed"
                              ? "text-neutral-200"
                              : "text-neutral-500"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/10 border border-white/30 rounded-xl text-center text-xs text-white font-semibold">
              This order has been CANCELLED. Please contact store support via WhatsApp for assistance.
            </div>
          )}

          {/* Items Purchased List */}
          <div className="border-t border-[#284234] pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Items in Package
            </h3>

            <div className="divide-y divide-[#284234]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-white">{item.product.name}</h4>
                    <p className="text-neutral-400">Size: {item.selectedSize} | Color: {item.selectedColor.name} | Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
