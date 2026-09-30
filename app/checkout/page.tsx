"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/components/cart/cart-context";
import { useUserAuth } from "@/components/auth/user-auth-context";
import { CheckoutFormValues, Order } from "@/types/store";
import { processCashfreeOrderAction } from "@/actions/order";
import { formatCurrency } from "@/lib/utils";
import { calculateTotals } from "@/lib/pricing";
import CashfreePaymentModal from "@/components/checkout/CashfreePaymentModal";
import { generateOrderInvoicePdf } from "@/lib/generateInvoicePdf";
import { toast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useUserAuth();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
    paymentMethod: "cashfree",
  });

  // Auto-fill form values when user logs in
  React.useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      setFormValues((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState("");
  
  // Cashfree Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");

  const submitting = useRef(false);
  const submission = useRef<{ payload: string; requestId: string } | null>(null);

  const totals = calculateTotals(subtotal);

  // Address completeness check
  const isAddressComplete = Boolean(
    formValues.firstName.trim() &&
    formValues.lastName.trim() &&
    formValues.phone.trim().replace(/\D/g, "").length >= 10 &&
    formValues.email.trim() &&
    formValues.address.trim().length >= 5 &&
    formValues.city.trim() &&
    formValues.state.trim() &&
    formValues.pincode.trim().length >= 5
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    if (errors[name as keyof CheckoutFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateAddressStrict = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    if (!formValues.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formValues.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formValues.phone.trim() || formValues.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter valid 10-digit mobile number";
    }
    if (!formValues.email.trim() || !formValues.email.includes("@")) {
      newErrors.email = "Valid email address is required";
    }
    if (!formValues.address.trim() || formValues.address.trim().length < 5) {
      newErrors.address = "Complete street address is required";
    }
    if (!formValues.city.trim()) newErrors.city = "City is required";
    if (!formValues.state.trim()) newErrors.state = "State is required";
    if (!formValues.pincode.trim() || formValues.pincode.trim().length < 5) {
      newErrors.pincode = "Valid 6-digit postal pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation: Do not allow placing order without full address
    if (!validateAddressStrict()) {
      setFormError("Please fill in all mandatory delivery address fields before proceeding to payment.");
      return;
    }

    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = JSON.stringify({ formValues, cart });
      if (submission.current?.payload !== payload) {
        submission.current = { payload, requestId: crypto.randomUUID() };
      }

      const res = await processCashfreeOrderAction(formValues, cart, submission.current.requestId);

      if (res.success && res.order) {
        setPendingOrder(res.order);
        setPaymentSessionId(res.paymentSessionId || "");
        setIsModalOpen(true);
      } else {
        if (res.validationErrors) setErrors(res.validationErrors);
        setFormError(res.error || "Unable to proceed to payment. Please review your address details.");
      }
    } catch {
      setFormError("We could not initialize checkout. Please check your connection and retry.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    setIsModalOpen(false);
    if (pendingOrder) {
      setCompletedOrder({
        ...pendingOrder,
        status: "CONFIRMED",
      });
      clearCart();
    }
  };

  const handlePaymentFailure = (errorMsg: string) => {
    setIsModalOpen(false);
    setFormError(errorMsg || "Payment was not completed. You can re-attempt payment.");
  };

  // 1. Order Confirmed Screen
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-[#d4af37]/20 text-[#d4af37] rounded-full flex items-center justify-center mx-auto border-2 border-[#d4af37] shadow-xl shadow-[#d4af37]/10">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            Payment Verified via Cashfree
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Order Placed Successfully!
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto">
            Thank you for shopping with MANBRO. Your order <strong className="text-[#d4af37]">#{completedOrder.id}</strong> is confirmed and will be dispatched via India Post.
          </p>
        </div>

        {/* Order Receipt Card */}
        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto text-xs text-neutral-300 shadow-xl">
          <div className="flex justify-between border-b border-[#284234] pb-3 font-semibold text-white">
            <span className="text-neutral-400">Order Reference</span>
            <span className="font-mono text-[#d4af37] font-bold">{completedOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Recipient</span>
            <span className="text-white font-medium">{completedOrder.shippingAddress.firstName} {completedOrder.shippingAddress.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Phone & Email</span>
            <span className="text-white font-medium">{completedOrder.shippingAddress.phone}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-neutral-400 shrink-0">Delivery Address</span>
            <span className="text-right text-white font-medium">
              {completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} - {completedOrder.shippingAddress.pincode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Payment Gateway</span>
            <span className="text-emerald-400 font-bold">Cashfree (PAID)</span>
          </div>
          <div className="flex justify-between font-black text-white pt-3 border-t border-[#284234] text-sm">
            <span>Total Paid</span>
            <span className="text-[#d4af37] text-base">{formatCurrency(completedOrder.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={async () => {
              try {
                setIsDownloadingPdf(true);
                await generateOrderInvoicePdf(completedOrder);
              } catch (err) {
                console.error("PDF download error:", err);
                toast.error("Could not generate invoice PDF. Please try again.");
              } finally {
                setIsDownloadingPdf(false);
              }
            }}
            disabled={isDownloadingPdf}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDownloadingPdf ? "Generating PDF..." : "📄 Download PDF Receipt with QR Code"}
          </button>
          <Link
            href={`/track?orderId=${encodeURIComponent(completedOrder.id)}`}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#11301F] border border-[#284234] text-[#d4af37] font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#d4af37] transition"
          >
            Track Status
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

  // 2. Empty Bag Screen
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#11301F] border border-[#284234] flex items-center justify-center mx-auto text-2xl">
          🛍️
        </div>
        <h2 className="text-2xl font-bold text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-neutral-400">Add luxury apparel to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#d4af37] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition shadow-lg shadow-[#d4af37]/20"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  // 3. Main Checkout Page UI
  return (
    <>
      {/* Cashfree Official SDK Script */}
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />

      <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#d4af37] bg-[#11301F] border border-[#284234] px-3 py-1 rounded-full">
              Cashfree Secure Gateway
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Checkout & Shipping
          </h1>
          <p className="text-xs text-neutral-400">
            Please enter your complete delivery address. You can complete payment via UPI, Cards, NetBanking, or Wallets in the Cashfree modal.
          </p>
        </div>

        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left Column: Delivery Address Form */}
          <fieldset disabled={isSubmitting} className="lg:col-span-7 space-y-6 min-w-0">
            <div className="bg-[#11301F]/80 border border-[#284234] rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#284234]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-black font-black text-[11px] sm:text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                    Shipping & Delivery Address
                  </h2>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-semibold">
                  * All fields required
                </span>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul"
                    className={`w-full bg-[#091D12] border ${
                      errors.firstName ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.firstName && <span className="text-[10px] text-red-400 mt-1 block">{errors.firstName}</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sharma"
                    className={`w-full bg-[#091D12] border ${
                      errors.lastName ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.lastName && <span className="text-[10px] text-red-400 mt-1 block">{errors.lastName}</span>}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength={15}
                    className={`w-full bg-[#091D12] border ${
                      errors.phone ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.phone && <span className="text-[10px] text-red-400 mt-1 block">{errors.phone}</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="rahul@example.com"
                    className={`w-full bg-[#091D12] border ${
                      errors.email ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.email && <span className="text-[10px] text-red-400 mt-1 block">{errors.email}</span>}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Complete Street Address (Flat / House No / Landmark) *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleInputChange}
                  placeholder="Flat 402, Sunshine Heights, 12th Main Road, Indiranagar"
                  className={`w-full bg-[#091D12] border ${
                    errors.address ? "border-red-500" : "border-[#284234]"
                  } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                  required
                />
                {errors.address && <span className="text-[10px] text-red-400 mt-1 block">{errors.address}</span>}
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formValues.city}
                    onChange={handleInputChange}
                    placeholder="Bengaluru"
                    className={`w-full bg-[#091D12] border ${
                      errors.city ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.city && <span className="text-[10px] text-red-400 mt-1 block">{errors.city}</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formValues.state}
                    onChange={handleInputChange}
                    placeholder="Karnataka"
                    className={`w-full bg-[#091D12] border ${
                      errors.state ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.state && <span className="text-[10px] text-red-400 mt-1 block">{errors.state}</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formValues.pincode}
                    onChange={handleInputChange}
                    placeholder="560038"
                    maxLength={10}
                    className={`w-full bg-[#091D12] border ${
                      errors.pincode ? "border-red-500" : "border-[#284234]"
                    } rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition`}
                    required
                  />
                  {errors.pincode && <span className="text-[10px] text-red-400 mt-1 block">{errors.pincode}</span>}
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Delivery Notes / Landmark (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formValues.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions for the delivery executive..."
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] transition"
                />
              </div>
            </div>

            {/* Payment Method Selector Card */}
            <div className="bg-[#11301F]/80 border border-[#284234] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-[#284234]">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Payment Method
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#091D12] border-2 border-[#d4af37] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-[#d4af37] bg-white flex items-center justify-center" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase">Cashfree Payment Gateway</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#d4af37] text-black uppercase">Instant</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Pay via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Wallets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-lg">
                  <span>⚡</span>
                  <span>💳</span>
                  <span>🏦</span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Right Column: Order Summary & Place Order CTA */}
          <div className="lg:col-span-5 bg-[#11301F] border border-[#284234] rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-2xl">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider pb-4 border-b border-[#284234] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-[#d4af37]">{cart.length} items</span>
            </h2>

            {/* Cart Items List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-[#284234]">
              {cart.map((item) => (
                <div key={item.id} className="pt-4 flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-xl bg-[#091D12] overflow-hidden shrink-0 border border-[#284234]">
                    <Image
                      src={(item.selectedColor && item.product.colorImages?.[item.selectedColor.name]) || item.product.images[0] || "/images/products/tshirt-burgundy.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <h4 title={item.product.name} className="font-bold text-white line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-neutral-400 text-[11px]">
                      Size: <span className="text-white font-medium">{item.selectedSize}</span> • Color: <span className="text-white font-medium">{item.selectedColor.name}</span>
                    </p>
                    <p className="text-neutral-400 text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-extrabold text-white">
                    {(() => {
                      const variant = item.product.variants.find(
                        (v) => v.size === item.selectedSize && v.color.name === item.selectedColor.name
                      );
                      const price = variant?.price ?? item.product.price;
                      return formatCurrency(price * item.quantity);
                    })()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-[#284234] space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Shipping / Delivery</span>
                <span>{totals.shipping === 0 ? <strong className="text-[#d4af37]">FREE</strong> : formatCurrency(totals.shipping)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>GST (5%)</span>
                <span className="text-white font-medium">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="pt-3 border-t border-[#284234] flex justify-between text-base font-black text-white">
                <span>Total Amount</span>
                <span className="text-[#d4af37] text-lg">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs leading-relaxed flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Address Requirement Warning */}
            {!isAddressComplete && (
              <div className="p-3 bg-[#091D12] border border-[#284234] rounded-xl text-[11px] text-amber-300/90 flex items-center gap-2">
                <span>📍</span>
                <span>Please complete your full shipping address above to enable order placement.</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isAddressComplete}
              className="w-full py-4 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-black text-xs uppercase tracking-widest rounded-2xl transition active:scale-98 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span>Securing Order Session...</span>
              ) : (
                <span>Proceed to Pay {formatCurrency(totals.total)}</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1">🔒 256-Bit SSL</span>
              <span>•</span>
              <span className="flex items-center gap-1">🛡️ Cashfree Protected</span>
            </div>
          </div>
        </form>

        {/* Cashfree Payment Gateway Modal */}
        {pendingOrder && (
          <CashfreePaymentModal
            isOpen={isModalOpen}
            orderId={pendingOrder.id}
            amount={pendingOrder.total}
            customerName={`${pendingOrder.shippingAddress.firstName} ${pendingOrder.shippingAddress.lastName}`}
            paymentSessionId={paymentSessionId}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />
        )}
      </div>
    </>
  );
}
