import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | MANBRO",
  description: "Read the Terms and Conditions governing your use of MANBRO apparel and services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#091D12] text-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[#284234] pb-6 space-y-2">
          <div className="inline-block px-3 py-1 bg-[#11301F] border border-[#284234] rounded-full text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">
            TERMS OF SERVICE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Terms & Conditions
          </h1>
          <p className="text-xs text-neutral-400">
            Effective Date: September 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing products on <strong className="text-white">MANBRO</strong> (accessible via manbro.com / manbro.store), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              2. User Accounts & Registration
            </h2>
            <p>
              To add products to your shopping bag or place an order, you must register with a valid mobile number, full name, and password. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              3. Products, Pricing & Availability
            </h2>
            <p>
              We strive to display our apparel accurately, including colors, fabric compositions, and silhouettes. However, actual colors may vary slightly depending on your monitor settings.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-300">
              <li>All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</li>
              <li>Product availability and pricing are subject to change without prior notice.</li>
              <li>In the rare event that an item is ordered but out of stock, our team will promptly issue a refund or notify you.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              4. Orders, Payments & Checkout
            </h2>
            <p>
              When placing an order, you must provide accurate and complete delivery details (recipient name, complete address, pincode, and contact number). Payment is processed through verified secure payment gateways (Cashfree) or direct supported channels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              5. Shipping, Courier & Tracking
            </h2>
            <p>
              Orders are dispatched via trusted carriers including <strong className="text-white">India Post</strong>. Once shipped, customers receive a unique tracking number to monitor package progress online via our{" "}
              <Link href="/track" className="text-[#d4af37] hover:underline font-bold">
                Track Order
              </Link>{" "}
              page. Delivery timelines may vary based on location and carrier transit schedules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              6. Returns, Exchanges & Cancellations
            </h2>
            <p>
              We stand by our quality craftsmanship. If you receive a damaged or incorrect product, please contact us within 7 days of delivery with your order ID and photographic evidence for a replacement or resolution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              7. Intellectual Property
            </h2>
            <p>
              All trademarks, logos, emblems, product designs, graphics, and text on this site are the exclusive property of <strong className="text-white">MANBRO</strong>. Unauthorized reproduction or commercial use without written permission is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              8. Contact Information
            </h2>
            <p>
              For legal inquiries, feedback, or assistance regarding these terms, please contact us through our{" "}
              <Link href="/contact" className="text-[#d4af37] hover:underline font-bold">
                Contact Page
              </Link>
              .
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="pt-8 border-t border-[#284234]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] hover:text-[#c29e2e] transition uppercase tracking-wider"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
