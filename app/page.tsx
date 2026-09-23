import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/db/catalog";
import { HomeProductCard } from "@/components/catalog/home-product-card";

export const dynamic = "force-dynamic";

const fallbackTShirts = [
  {
    id: "fb-t1",
    name: "ADVENTURE T-SHIRT",
    slug: "adventure-t-shirt-burgundy",
    price: 350,
    originalPrice: 399,
    category: "T-Shirts",
    images: ["/images/products/tshirt-burgundy.jpg"],
  },
  {
    id: "fb-t2",
    name: "ADVENTURE T-SHIRT",
    slug: "adventure-t-shirt-blackgold",
    price: 350,
    originalPrice: 399,
    category: "T-Shirts",
    images: ["/images/products/tshirt-blackgold.jpg"],
  },
  {
    id: "fb-t3",
    name: "ADVENTURE T-SHIRT",
    slug: "adventure-t-shirt-yellowsun",
    price: 350,
    originalPrice: 399,
    category: "T-Shirts",
    images: ["/images/products/tshirt-yellowsun.jpg"],
  },
  {
    id: "fb-t4",
    name: "ADVENTURE T-SHIRT",
    slug: "adventure-t-shirt-darkgreen",
    price: 350,
    originalPrice: 399,
    category: "T-Shirts",
    images: ["/images/products/tshirt-darkgreen.jpg"],
  },
  {
    id: "fb-t5",
    name: "ADVENTURE T-SHIRT",
    slug: "adventure-t-shirt-greywash",
    price: 350,
    originalPrice: 399,
    category: "T-Shirts",
    images: ["/images/products/tshirt-greywash.jpg"],
  },
];

const fallbackOversized = [
  {
    id: "fb-o1",
    name: "ADVENTURE T-SHIRT",
    slug: "oversized-adventure-burgundy",
    price: 350,
    originalPrice: 399,
    category: "Oversized T-shirts",
    images: ["/images/products/tshirt-burgundy.jpg"],
  },
  {
    id: "fb-o2",
    name: "ADVENTURE T-SHIRT",
    slug: "oversized-adventure-blackgold",
    price: 350,
    originalPrice: 399,
    category: "Oversized T-shirts",
    images: ["/images/products/tshirt-blackgold.jpg"],
  },
  {
    id: "fb-o3",
    name: "ADVENTURE T-SHIRT",
    slug: "oversized-adventure-yellowsun",
    price: 350,
    originalPrice: 399,
    category: "Oversized T-shirts",
    images: ["/images/products/tshirt-yellowsun.jpg"],
  },
  {
    id: "fb-o4",
    name: "ADVENTURE T-SHIRT",
    slug: "oversized-adventure-darkgreen",
    price: 350,
    originalPrice: 399,
    category: "Oversized T-shirts",
    images: ["/images/products/tshirt-darkgreen.jpg"],
  },
  {
    id: "fb-o5",
    name: "ADVENTURE T-SHIRT",
    slug: "oversized-adventure-greywash",
    price: 350,
    originalPrice: 399,
    category: "Oversized T-shirts",
    images: ["/images/products/tshirt-greywash.jpg"],
  },
];

export default async function HomePage() {
  let allProducts: any[] = [];
  try {
    allProducts = await getProducts();
  } catch {}

  const dbTShirts = allProducts.filter(
    (p) => p.category === "T-Shirts" || p.category?.toLowerCase().includes("t-shirt")
  );
  const dbOversized = allProducts.filter(
    (p) => p.category === "Oversized T-shirts" || p.category === "Hoodies"
  );

  const displayTShirts = dbTShirts.length >= 4 ? dbTShirts.slice(0, 5) : fallbackTShirts;
  const displayOversized = dbOversized.length >= 4 ? dbOversized.slice(0, 5) : fallbackOversized;

  return (
    <div className="min-h-screen bg-[#091D12] text-white">
      {/* Hero Section */}
      <section className="relative w-full bg-[#091D12] overflow-hidden border-b border-[#284234]">
        {/* Desktop & Tablet (md and above): Exact 2100x749 Widescreen Banner with Hotspot */}
        <div className="hidden md:block w-full max-w-[1920px] mx-auto relative">
          <div className="relative w-full aspect-[2100/749] select-none">
            <Image
              src="/images/hero-banner.png"
              alt="MANBRO - BUILD DIFFERENT. MADE TO STAND OUT. Premium streetwear for those who set their own rules."
              fill
              priority
              className="w-full h-full object-cover sm:object-contain object-center"
              sizes="100vw"
            />
            {/* Interactive Clickable Hotspot over the exact 'SHOP NOW ->' button */}
            <Link
              href="/shop"
              aria-label="Shop Now - Browse Collection"
              className="absolute rounded-md transition duration-200 hover:ring-2 hover:ring-[#d4af37]/70 hover:backdrop-brightness-110 active:scale-[0.98] cursor-pointer"
              style={{
                left: "4.62%",
                top: "73.16%",
                width: "15.14%",
                height: "11.35%",
              }}
            />
          </div>
        </div>

        {/* Mobile View (< md): High-impact, fully readable, and thumb-friendly */}
        <div className="md:hidden relative w-full overflow-hidden flex flex-col justify-end min-h-[480px] xs:min-h-[520px] px-5 sm:px-8 py-10">
          {/* Couple Background Image positioned for portrait mobile screens */}
          <div className="absolute inset-0 pointer-events-none select-none z-0">
            <div className="absolute -right-6 -top-2 w-[125%] h-[85%] opacity-55">
              <Image
                src="/images/hero-couple-exact.png"
                alt="MANBRO Streetwear Couple"
                fill
                priority
                className="object-contain object-right-top"
                sizes="100vw"
              />
            </div>
            {/* Dark green gradient scrims for 100% text contrast and legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#091D12] via-[#091D12]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#091D12] via-[#091D12]/70 to-transparent" />
          </div>

          {/* Mobile Content */}
          <div className="relative z-10 space-y-4 max-w-sm pt-28">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#d4af37]">
              NEW COLLECTION
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-[1.12] tracking-tight uppercase">
              BUILD DIFFERENT.
              <br />
              <span className="text-[#d4af37]">MADE TO STAND OUT.</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
              Premium streetwear for those who set their own rules.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-md hover:bg-[#c29e2e] active:scale-[0.98] transition shadow-lg shadow-[#d4af37]/20 cursor-pointer"
              >
                SHOP NOW
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Accessible semantic markup for SEO and screen readers */}
        <div className="sr-only">
          <span>NEW COLLECTION</span>
          <h2>BUILD DIFFERENT. MADE TO STAND OUT.</h2>
          <p>Premium streetwear for those who set their own rules.</p>
          <Link href="/shop">SHOP NOW</Link>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#091D12] border-b border-[#284234]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center">
            {/* Free Shipping */}
            <div className="flex items-center gap-3.5">
              <svg className="w-8 h-8 text-[#d4af37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <rect x="1" y="5" width="15" height="11" rx="1" />
                <path d="M16 8h4l3 4v4h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  FREE SHIPPING
                </h4>
                <p className="text-xs text-neutral-300">On orders over $100</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center gap-3.5">
              <svg className="w-8 h-8 text-[#d4af37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  EASY RETURNS
                </h4>
                <p className="text-xs text-neutral-300">7-day returns</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-center gap-3.5">
              <svg className="w-8 h-8 text-[#d4af37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  SECURE PAYMENT
                </h4>
                <p className="text-xs text-neutral-300">100% secure checkout</p>
              </div>
            </div>

            {/* Customer Support */}
            <div className="flex items-center gap-3.5">
              <svg className="w-8 h-8 text-[#d4af37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
              </svg>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  CUSTOMER SUPPORT
                </h4>
                <p className="text-xs text-neutral-300">24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* T-Shirts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            T-SHIRTS
          </h2>
          <Link
            href="/shop?category=T-Shirts"
            className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider hover:text-[#c29e2e] transition underline underline-offset-4"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {displayTShirts.map((product) => (
            <HomeProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Oversized T-Shirts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-[#284234]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            OVERSIZED T-SHIRTS
          </h2>
          <Link
            href="/shop?category=Oversized+T-shirts"
            className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider hover:text-[#c29e2e] transition underline underline-offset-4"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {displayOversized.map((product) => (
            <HomeProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>
    </div>
  );
}
