"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#091D12] text-white">
      <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        {/* Top Newsletter Card */}
        <div className="bg-[#182916] border border-[#293521] rounded-2xl p-5 sm:p-8 lg:p-10 mb-10 sm:mb-16">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6 lg:gap-10">
            {/* Left: Icon & Text */}
            <div className="flex items-center gap-3.5 sm:gap-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 7l10 7 10-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#d4af37] font-black text-xs sm:text-base tracking-wider uppercase">
                  STAY IN THE LOOP
                </h3>
                <p className="text-[11px] sm:text-sm text-neutral-300 mt-0.5">
                  New drops, exclusive offers, and more.
                </p>
              </div>
            </div>

            {/* Right: Newsletter Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#182714] border border-[#293521] sm:border-r-0 text-white placeholder:text-neutral-400 text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3.5 focus:outline-none focus:border-[#d4af37] w-full sm:w-80 rounded-t-lg sm:rounded-t-none sm:rounded-l-lg transition"
              />
              <button
                type="submit"
                className="bg-[#d4af37] hover:bg-[#c29e2e] text-black font-black text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-7 py-2.5 sm:py-3.5 transition flex items-center justify-center rounded-b-lg sm:rounded-b-none sm:rounded-r-lg shrink-0 cursor-pointer"
              >
                {subscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-6">
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4 space-y-4 sm:space-y-5">
            <Link href="/" className="inline-flex items-center group">
              <div className="relative h-8 sm:h-11 w-[200px] sm:w-[282px] shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/images/logo-full.png"
                  alt="MANBRO"
                  fill
                  sizes="(max-width: 640px) 200px, 282px"
                  className="object-contain"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-[15px] text-white/90 leading-relaxed font-normal">
              Streetwear made for the bold.<br />
              Designed to break the norm.<br />
              Worn worldwide.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-1">
              {/* Instagram */}
              <a
                href="#"
                className="text-white hover:text-[#d4af37] transition p-1"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" strokeWidth={2.5} />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                className="text-white hover:text-[#d4af37] transition p-1"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
              </a>

              {/* X */}
              <a
                href="#"
                className="text-white hover:text-[#d4af37] transition p-1"
                aria-label="X"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href="#"
                className="text-white hover:text-[#d4af37] transition p-1"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-[11px] sm:text-sm text-white/70 font-normal pt-1">
              &copy; 2026 MANBRO. All rights reserved.
            </p>
          </div>

          {/* Spacer for desktop layout balance */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Shop Column */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-[#d4af37] font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              SHOP
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="text-white hover:text-[#d4af37] transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=T-Shirts" className="text-white hover:text-[#d4af37] transition">
                  T-shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Oversized+T-shirts" className="text-white hover:text-[#d4af37] transition">
                  Oversized T-shirts
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="text-[#d4af37] font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/contact" className="text-white hover:text-[#d4af37] transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#d4af37] transition">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#d4af37] transition">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#d4af37] transition">
                  Size Guide
                </a>
              </li>
              <li>
                <Link href="/track" className="text-white hover:text-[#d4af37] transition">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#d4af37] transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#284234]">
            <h4 className="text-[#d4af37] font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-white hover:text-[#d4af37] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-[#d4af37] transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-white hover:text-[#d4af37] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-white hover:text-[#d4af37] transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
