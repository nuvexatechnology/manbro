import React from "react";
import Link from "next/link";
import { Product } from "@/types/store";

interface HomeProductCardProps {
  product: Product;
}

export function HomeProductCard({ product }: HomeProductCardProps) {
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const originalPrice = product.originalPrice || Math.round(product.price * 1.15);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 10;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-[#11301F]/80 border border-[#284234] rounded-2xl p-2.5 sm:p-3 hover:border-[#d4af37]/60 transition flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-[#082816] rounded-xl overflow-hidden mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#284234]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wide truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-white">₹{product.price}</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 line-through">₹{originalPrice}</span>
          <span className="text-[11px] sm:text-xs font-bold text-[#d4af37]">{discountPercent}%OFF</span>
        </div>
      </div>
    </Link>
  );
}
