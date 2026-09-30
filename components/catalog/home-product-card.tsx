"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ColorOption } from "@/types/store";
import { useCart } from "../cart/cart-context";
import { formatCurrency } from "@/lib/utils";

interface HomeProductCardProps {
  product: Product;
}

export function HomeProductCard({ product }: HomeProductCardProps) {
  const { addToCart, cart } = useCart();
  
  const cartItemCount = cart
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(
    product.variants?.find((variant) => variant.stock > 0)?.color ?? product.colors?.[0]
  );
  
  const selectedVariant = product.variants?.find((variant) =>
    variant.color.name === selectedColor?.name && variant.stock > 0
  );
  const selectedSize = selectedVariant?.size ?? product.sizes?.[0];

  const getVariantStock = (size: string, color: ColorOption) => {
    const variant = product.variants?.find(
      (v) => v.size === size && v.color.name === color.name
    );
    return variant ? variant.stock : 0;
  };

  const isVariantInStock = (size: string, color: ColorOption) => {
    return getVariantStock(size, color) > 0;
  };

  const activeImage =
    (selectedColor && product.colorImages?.[selectedColor.name]) ||
    product.images?.[0] ||
    "/images/products/tshirt-burgundy.jpg";

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 10;
  const originalPrice = product.originalPrice || Math.round(product.price * 1.15);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor);
    }
  };

  const isAvailable = Boolean(selectedVariant || (selectedSize && selectedColor));

  return (
    <div className="group bg-[#11301F]/90 border border-[#284234] rounded-2xl p-2.5 sm:p-3.5 md:p-4 hover:border-[#d4af37]/70 hover:shadow-2xl hover:shadow-black/50 transition duration-300 flex flex-col justify-between h-full">
      {/* Top Image & Details */}
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] w-full bg-[#082816] rounded-xl overflow-hidden mb-2.5 sm:mb-3.5 border border-[#284234]/60">
          <Link
            href={`/product/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-[#d4af37]"
          >
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {cartItemCount > 0 && (
              <span className="bg-[#d4af37] text-black font-black text-[9px] sm:text-[10px] uppercase px-1.5 sm:px-2 py-0.5 rounded shadow flex items-center gap-1 border border-black/20">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                In Bag ({cartItemCount})
              </span>
            )}
            {discount > 0 && (
              <span className="bg-black/80 text-[#d4af37] border border-[#d4af37]/40 font-black text-[9px] sm:text-[10px] uppercase px-1.5 py-0.5 rounded shadow backdrop-blur-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {product.rating > 0 && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-[#091D12]/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 border border-[#284234] z-10">
              <span className="text-[#d4af37]">★</span>
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="hover:text-[#d4af37] transition block mb-1">
          <h3 title={product.name} className="text-xs sm:text-sm md:text-base font-extrabold text-[#d4af37] uppercase tracking-wide truncate">
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
          <span className="text-sm sm:text-base md:text-lg font-black text-white">
            {formatCurrency(selectedVariant?.price ?? product.price)}
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
            {formatCurrency(originalPrice)}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[#d4af37]">
            {discount}% OFF
          </span>
        </div>

        {/* Color Preview Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
            {product.colors.map((color) => {
              const hasStock = product.sizes?.some((size) => isVariantInStock(size, color)) ?? true;
              const isSelected = selectedColor?.name === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                  aria-pressed={isSelected}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition cursor-pointer ${
                    isSelected
                      ? "border-[#d4af37] scale-125 ring-2 ring-[#d4af37]/40 shadow"
                      : hasStock
                      ? "border-neutral-600 opacity-70 hover:opacity-100"
                      : "border-neutral-800 opacity-30 cursor-not-allowed"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  disabled={!hasStock}
                />
              );
            })}
            <span className="text-[9px] sm:text-[10px] text-neutral-400 ml-0.5">
              {product.colors.length} {product.colors.length === 1 ? "color" : "colors"}
            </span>
          </div>
        )}
      </div>

      {/* Always Visible Add to Bag Button */}
      <div className="pt-1.5 sm:pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3.5 rounded-xl font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98] ${
            isAvailable
              ? "bg-[#d4af37] text-black hover:bg-[#c29e2e] shadow-[#d4af37]/20"
              : "bg-[#091D12] text-neutral-500 border border-[#284234] cursor-not-allowed"
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="truncate">
            {cartItemCount > 0 ? `In Bag (${cartItemCount})` : "Add to Bag"}
          </span>
        </button>
      </div>
    </div>
  );
}
