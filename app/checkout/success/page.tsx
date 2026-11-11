"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { verifyCashfreeOrderAction } from "@/actions/order";
import { formatCurrency } from "@/lib/utils";
import { generateOrderInvoicePdf } from "@/lib/generateInvoicePdf";
import { toast } from "@/components/ui/toast";
import type { Order } from "@/types/store";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setErrorMessage("No order reference provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const res = await verifyCashfreeOrderAction(orderId as string);
        if (!isMounted) return;

        if (res.success && res.order) {
          setOrder(res.order);
          clearCart();
        } else {
          setErrorMessage(res.error || "Payment verification pending or unsuccessful.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(err?.message || "Failed to verify payment status.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-[#284234] border-t-[#d4af37] rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Verifying Cashfree Payment</h2>
        <p className="text-xs text-neutral-400">Please wait while we confirm your payment with Cashfree...</p>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-2xl text-red-400">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white uppercase">Payment Verification</h1>
          <p className="text-xs text-red-300 max-w-md mx-auto">{errorMessage || "Unable to confirm payment status."}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Link
            href="/checkout"
            className="px-6 py-3 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition"
          >
            Return to Checkout
          </Link>
          <Link
            href="/track"
            className="px-6 py-3 bg-[#11301F] border border-[#284234] text-[#d4af37] font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#d4af37] transition"
          >
            Track Order
          </Link>
        </div>
      </div>
    );
  }

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
          Thank you for shopping with MANBRO. Your order <strong className="text-[#d4af37]">#{order.id}</strong> is confirmed and will be dispatched via India Post.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto text-xs text-neutral-300 shadow-xl">
        <div className="flex justify-between border-b border-[#284234] pb-3 font-semibold text-white">
          <span className="text-neutral-400">Order Reference</span>
          <span className="font-mono text-[#d4af37] font-bold">{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Recipient</span>
          <span className="text-white font-medium">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Phone & Email</span>
          <span className="text-white font-medium">{order.shippingAddress.phone}</span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-neutral-400 shrink-0">Delivery Address</span>
          <span className="text-right text-white font-medium">
            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Payment Gateway</span>
          <span className="text-emerald-400 font-bold">Cashfree (PAID)</span>
        </div>
        <div className="flex justify-between font-black text-white pt-3 border-t border-[#284234] text-sm">
          <span>Total Paid</span>
          <span className="text-[#d4af37] text-base">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={async () => {
            try {
              setIsDownloadingPdf(true);
              await generateOrderInvoicePdf(order);
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
          href={`/track?orderId=${encodeURIComponent(order.id)}`}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#11301F] border border-[#284234] text-[#d4af37] font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#d4af37] transition"
        >
          Track with India Post
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-wider transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#284234] border-t-[#d4af37] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Loading order confirmation...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
