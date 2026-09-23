"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "../cart/cart-context";

export function Header() {
  const pathname = usePathname();
  const { toggleCart, totalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "SHOP", href: "/shop" },
    { label: "ABOUT US", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#091D12] text-white select-none">
      {/* Top Announcement Bar */}
      <div className="bg-[#091D12] border-b border-[#284234] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wide">
          {/* Left Info Items */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Free Shipping */}
            <div className="flex items-center gap-2">
              {/* Delivery Truck Icon */}
              <svg
                className="w-4 h-4 text-[#d4af37] shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
              <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                FREE SHIPPING ON ORDERS OVER $100
              </span>
            </div>

            {/* Discount Code */}
            <div className="hidden md:flex items-center gap-2">
              {/* Discount / Coupon Badge Icon */}
              <svg
                className="w-4 h-4 text-[#d4af37] shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
              </svg>
              <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                10% OFF YOUR FIRST ORDER | CODE:{" "}
                <span className="text-[#d4af37]">MANBRO10</span>
              </span>
            </div>
          </div>

          {/* Right Support Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/help"
              className="font-bold text-white hover:text-[#d4af37] transition uppercase text-[11px] sm:text-xs"
            >
              HELP & SUPPORT
            </Link>
            <Link
              href="/track"
              className="font-bold text-white hover:text-[#d4af37] transition uppercase text-[11px] sm:text-xs"
            >
              TRACK ORDER
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-[#091D12] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo (Exact emblem + bespoke name) */}
          <Link href="/" className="inline-flex items-center group">
            <div className="relative h-8 sm:h-9 w-[205px] sm:w-[230px] shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo-full.png"
                alt="MANBRO"
                fill
                sizes="230px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && pathname === "/");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-bold tracking-wider uppercase transition relative py-1 ${
                    isActive
                      ? "text-[#d4af37] border-b-2 border-[#d4af37]"
                      : "text-white hover:text-[#d4af37]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Search, Cart, Mobile Menu) */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Quick Search */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    placeholder="Search MANBRO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#11301F] border border-[#284234] text-white text-xs rounded-full px-3 py-1.5 w-36 sm:w-48 focus:outline-none focus:border-[#d4af37] transition placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-1 text-gray-400 hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white hover:text-[#d4af37] transition p-1 focus:outline-none"
                  aria-label="Search"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="text-[#d4af37] hover:text-white transition p-1 relative focus:outline-none flex items-center"
              aria-label="View Cart"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-[#d4af37] transition p-1 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#091D12] border-b border-[#284234] px-4 py-3">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold tracking-wider uppercase py-1 ${
                    isActive ? "text-[#d4af37]" : "text-white hover:text-[#d4af37]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

