"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CheckoutFormValues, Order } from "@/types/store";
import { processWhatsAppOrderAction } from "@/actions/order";
import { formatCurrency } from "@/lib/utils";
import { calculateTotals } from "@/lib/pricing";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();

  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    paymentMethod: "whatsapp",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const submitting = useRef(false);
  const submission = useRef<{ payload: string; requestId: string } | null>(null);

  const totals = calculateTotals(subtotal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    if (errors[name as keyof CheckoutFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      const payload = JSON.stringify({ formValues, cart });
      if (submission.current?.payload !== payload) {
        submission.current = { payload, requestId: crypto.randomUUID() };
      }

      const res = await processWhatsAppOrderAction(formValues, cart, submission.current.requestId);

      if (res.success && res.order && res.whatsappUrl) {
        setCompletedOrder(res.order);
        setWhatsappUrl(res.whatsappUrl);
        clearCart();
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        if (res.validationErrors) setErrors(res.validationErrors);
        setFormError(res.error || "Your order could not be placed. Please try again.");
      }
    } catch {
      setFormError("We could not confirm your order. Please try again with the same details.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto border border-white/30">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white">Order Saved</h1>
        <p className="text-neutral-400 text-sm max-w-md mx-auto">
          Your order <strong className="text-white">#{completedOrder.id}</strong> has been saved in our database. If WhatsApp did not open automatically, click below to send your prepared order message.
        </p>

        <div className="bg-[#11301F] border border-[#284234] rounded-xl p-6 text-left space-y-4 max-w-md mx-auto text-xs text-neutral-300">
          <div className="flex justify-between border-b border-[#284234] pb-3 font-semibold text-white">
            <span>Order Reference ID</span>
            <span className="font-mono text-white">{completedOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer Name</span>
            <span>{completedOrder.shippingAddress.firstName} {completedOrder.shippingAddress.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone</span>
            <span>{completedOrder.shippingAddress.phone}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Address</span>
            <span>{completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} - {completedOrder.shippingAddress.pincode}</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-[#284234] text-sm">
            <span>Total Payable</span>
            <span>{formatCurrency(completedOrder.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#d4af37] text-black font-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-300 active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
          >
            Send Order on WhatsApp
          </a>
          <Link
            href={`/track?orderId=${encodeURIComponent(completedOrder.id)}`}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#d4af37] text-black font-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-300 transition"
          >
            Track Order Status
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#11301F] border border-[#284234] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#284234] transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-neutral-400">Add products to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#d4af37] text-black font-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#c29e2e] transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
          WhatsApp Direct Checkout
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight pt-2">
          Complete Your Order
        </h1>
        <p className="text-xs text-neutral-400">
          Your order will be saved safely in our database, then WhatsApp will launch with a pre-formatted message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Customer Form */}
        <fieldset disabled={isSubmitting} className="lg:col-span-7 space-y-8 min-w-0">
          <div className="bg-[#11301F]/60 border border-[#284234] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              1. Customer & Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  placeholder="Rahul"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.firstName && <span className="text-[11px] text-red-400 mt-1 block">{errors.firstName}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  placeholder="Sharma"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.lastName && <span className="text-[11px] text-red-400 mt-1 block">{errors.lastName}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="text"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.phone && <span className="text-[11px] text-red-400 mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  placeholder="rahul@example.com"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.email && <span className="text-[11px] text-red-400 mt-1 block">{errors.email}</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Street Address *</label>
              <input
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleInputChange}
                placeholder="Flat 402, Sunshine Apartments, MG Road"
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
              {errors.address && <span className="text-[11px] text-red-400 mt-1 block">{errors.address}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formValues.city}
                  onChange={handleInputChange}
                  placeholder="Bengaluru"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.city && <span className="text-[11px] text-red-400 mt-1 block">{errors.city}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formValues.state}
                  onChange={handleInputChange}
                  placeholder="Karnataka"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.state && <span className="text-[11px] text-red-400 mt-1 block">{errors.state}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formValues.pincode}
                  onChange={handleInputChange}
                  placeholder="560001"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
                {errors.pincode && <span className="text-[11px] text-red-400 mt-1 block">{errors.pincode}</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Order / Delivery Notes (Optional)</label>
              <textarea
                name="notes"
                rows={2}
                value={formValues.notes}
                onChange={handleInputChange}
                placeholder="Special delivery instructions, gate code, or gift note..."
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </fieldset>

        {/* Right Column: Summary & WhatsApp CTA */}
        <div className="lg:col-span-5 bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-6 sticky top-24">
          <h2 className="text-base font-bold text-white uppercase tracking-wider pb-4 border-b border-[#284234]">
            Order Summary ({cart.length} items)
          </h2>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-[#284234]">
            {cart.map((item) => (
              <div key={item.id} className="pt-4 flex gap-3 items-center">
                <div className="relative w-14 h-16 rounded bg-[#091D12] overflow-hidden shrink-0 border border-[#284234]">
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-xs">
                  <h4 title={item.product.name} className="font-semibold text-white line-clamp-1">{item.product.name}</h4>
                  <p className="text-neutral-400 mt-0.5">Size: {item.selectedSize} | Color: {item.selectedColor.name}</p>
                  <p className="text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-white">
                  {(() => {
                    const variant = item.product.variants.find(
                      v => v.size === item.selectedSize && v.color.name === item.selectedColor.name
                    );
                    const price = variant?.price ?? item.product.price;
                    return formatCurrency(price * item.quantity);
                  })()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#284234] space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery / Shipping</span>
              <span>{totals.shipping === 0 ? <strong className="text-white">FREE</strong> : formatCurrency(totals.shipping)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Estimated Tax</span>
              <span className="text-white font-semibold">{formatCurrency(totals.tax)}</span>
            </div>
            <div className="pt-3 border-t border-[#284234] flex justify-between text-base font-bold text-white">
              <span>Total Amount</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          {formError && (
            <p role="alert" className="p-3 rounded-lg bg-white/10 border border-white/30 text-white text-xs">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-white hover:bg-gray-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37] shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Placing Your Order..." : formError ? "Retry Order via WhatsApp" : "Place Order via WhatsApp"}
          </button>
          <p className="text-[11px] text-neutral-400 text-center">
            Saves your order safely to DB & opens WhatsApp with formatted message.
          </p>
        </div>
      </form>
    </div>
  );
}
