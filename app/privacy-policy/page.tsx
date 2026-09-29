import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MANBRO",
  description: "Learn how MANBRO collects, uses, and safeguards your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#091D12] text-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[#284234] pb-6 space-y-2">
          <div className="inline-block px-3 py-1 bg-[#11301F] border border-[#284234] rounded-full text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">
            LEGAL & TRANSPARENCY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-400">
            Last updated: September 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              1. Overview
            </h2>
            <p>
              At <strong className="text-white">MANBRO</strong>, we value your trust and are committed to protecting your privacy. This Privacy Policy outlines our practices regarding the collection, storage, and processing of your personal information when you browse our storefront, register an account, or make a purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              2. Information We Collect
            </h2>
            <p>We only collect information necessary to fulfill your orders and deliver an exceptional shopping experience:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-300">
              <li><strong className="text-white">Account Information:</strong> Name, mobile phone number, and encrypted password credentials.</li>
              <li><strong className="text-white">Delivery & Shipping:</strong> Recipient name, street address, city, state, postal pincode, and contact number.</li>
              <li><strong className="text-white">Order History & Tracking:</strong> Order identifiers, product choices (size, color, quantity), and consignment tracking status.</li>
              <li><strong className="text-white">Payment Information:</strong> Transaction references processed securely via PCI-compliant payment gateways (e.g. Cashfree). We do not store raw credit/debit card details on our servers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              3. How We Use Your Information
            </h2>
            <p>Your data is used strictly for:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-300">
              <li>Processing, fulfilling, packing, and dispatching your apparel orders.</li>
              <li>Providing India Post parcel consignment tracking and delivery notifications.</li>
              <li>Enabling customer service and WhatsApp support communications.</li>
              <li>Preventing fraudulent orders and maintaining account security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              4. Data Protection & Security
            </h2>
            <p>
              We implement industry-grade security measures, including HTTPS encryption, Row-Level Security (RLS) database policies, and restricted server-only environment configurations. Your session authentication is maintained via secure, httpOnly cookies to prevent unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              5. Third-Party Services
            </h2>
            <p>
              We partner with trusted logistic couriers (such as <strong className="text-white">India Post</strong>) and authorized payment providers (<strong className="text-white">Cashfree</strong>) solely for the purpose of order processing, payment verification, and dispatch. We do not sell, rent, or trade your personal information to any third parties for advertising or marketing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#d4af37] uppercase tracking-wide">
              6. Contact Us
            </h2>
            <p>
              If you have any questions or requests regarding your personal data or this policy, please reach out to our support desk via our{" "}
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
