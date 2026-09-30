"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "../cart/cart-context";
import { useUserAuth } from "../auth/user-auth-context";
import { SiteAnnouncementSettings, DEFAULT_ANNOUNCEMENT_SETTINGS } from "@/types/settings";

export function Header() {
  const pathname = usePathname();
  const { toggleCart, totalItems } = useCart();
  const { user, openLoginModal, openRegisterModal, logout } = useUserAuth();
  
  const [announcements, setAnnouncements] = useState<SiteAnnouncementSettings>(DEFAULT_ANNOUNCEMENT_SETTINGS);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load announcement settings
  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = () => {
      fetch("/api/settings/announcements", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.success && data.settings) {
            setAnnouncements(data.settings);
          }
        })
        .catch(() => {});
    };

    fetchAnnouncements();

    const handleUpdate = () => fetchAnnouncements();
    window.addEventListener("manbro-announcements-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("manbro-announcements-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {announcements.isEnabled && (
        <div className="bg-[#091D12] border-b border-[#284234] py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto flex items-center justify-between text-xs tracking-wide">
            {/* Left Info Items */}
            <div className="flex items-center gap-6 sm:gap-8">
              {/* Free Shipping */}
              {announcements.freeShippingText && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#d4af37] shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                  <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                    {announcements.freeShippingText}
                  </span>
                </div>
              )}

              {/* Discount Code */}
              {(announcements.offerText || announcements.offerCode) && (
                <div className="hidden md:flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#d4af37] shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 6.33 7 5.5 7z" />
                  </svg>
                  <span className="font-bold text-white uppercase text-[11px] sm:text-xs">
                    {announcements.offerText}{" "}
                    {announcements.offerCode && (
                      <span className="text-[#d4af37]">{announcements.offerCode}</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Right Support & Account Links */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/track"
                className="font-bold text-white hover:text-[#d4af37] transition uppercase text-[11px] sm:text-xs hidden sm:inline-block"
              >
                TRACK ORDER
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="text-[#d4af37] font-bold text-[11px] sm:text-xs hover:underline"
                  >
                    Hi, {user.name.split(" ")[0]}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-neutral-400 hover:text-white transition uppercase text-[10px] sm:text-[11px] underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <button
                    onClick={openLoginModal}
                    className="text-white hover:text-[#d4af37] transition"
                  >
                    SIGN IN
                  </button>
                  <span className="text-neutral-500">/</span>
                  <button
                    onClick={openRegisterModal}
                    className="text-[#d4af37] hover:underline transition"
                  >
                    REGISTER
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="bg-[#091D12] py-3.5 sm:py-4 px-3 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <Link href="/" className="inline-flex items-center group shrink-0">
            <div className="relative h-7 sm:h-9 w-[160px] xs:w-[185px] sm:w-[230px] transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo-full.png"
                alt="MANBRO"
                fill
                sizes="(max-width: 640px) 185px, 230px"
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

          {/* Right: Actions (User Icon, Search, Cart, Mobile Menu) */}
          <div className="flex items-center gap-3 sm:gap-5">
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

            {/* User Account Button & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (user) {
                    setIsUserMenuOpen((prev) => !prev);
                  } else {
                    openLoginModal();
                  }
                }}
                className={`p-1 transition focus:outline-none flex items-center gap-1.5 ${
                  user ? "text-[#d4af37]" : "text-white hover:text-[#d4af37]"
                }`}
                aria-label="User Account"
                title={user ? `Signed in as ${user.name}` : "Sign In / Register"}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {user && (
                  <span className="hidden lg:inline-block text-xs font-bold max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </button>

              {/* User Dropdown Menu */}
              {user && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2417] border border-[#284234] rounded-xl shadow-2xl py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-[#284234]">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#d4af37] tracking-wider">📱 {user.phone}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-[#153422] transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </Link>

                  <Link
                    href="/track"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-[#153422] transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Track Orders
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-[#153422] transition border-t border-[#284234] mt-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </div>
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
        <div className="md:hidden bg-[#091D12] border-b border-[#284234] px-4 py-4 space-y-3">
          {/* User Status Bar in Mobile Drawer */}
          <div className="pb-3 border-b border-[#284234]">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-[#d4af37]">📱 {user.phone}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="py-2 px-3 bg-[#11301F] border border-[#284234] rounded-lg text-xs font-bold text-white text-center hover:border-[#d4af37]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openRegisterModal();
                  }}
                  className="py-2 px-3 bg-[#d4af37] text-black rounded-lg text-xs font-black text-center hover:bg-[#c29e2e]"
                >
                  Register
                </button>
              </div>
            )}
          </div>

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
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold tracking-wider uppercase py-1 text-white hover:text-[#d4af37]"
            >
              MY PROFILE
            </Link>
            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold tracking-wider uppercase py-1 text-white hover:text-[#d4af37]"
            >
              TRACK ORDER
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
