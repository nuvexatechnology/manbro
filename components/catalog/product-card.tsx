"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ColorOption } from "@/types/store";
import { useCart } from "../cart/cart-context";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart } = useCart();
  const cartItemCount = cart
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(
    product.variants.find((variant) => variant.stock > 0)?.color ?? product.colors[0]
  );
  const selectedVariant = product.variants.find((variant) =>
    variant.color.name === selectedColor?.name && variant.stock > 0
  );
  const selectedSize = selectedVariant?.size;
  
  const getVariantStock = (size: string, color: ColorOption) => {
    const variant = product.variants.find(
      v => v.size === size && v.color.name === color.name
    );
    return variant ? variant.stock : 0;
  };
  
  const isVariantInStock = (size: string, color: ColorOption) => {
    return getVariantStock(size, color) > 0;
  };
  const [isHovered, setIsHovered] = useState(false);

  const activeImage = (selectedColor && product.colorImages?.[selectedColor.name]) || product.images[0] || "/images/products/tshirt-burgundy.jpg";

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 10;
  const originalPrice = product.originalPrice || Math.round(product.price * 1.15);

  return (
    <div
      className="group relative bg-[#11301F]/90 border border-[#284234] rounded-2xl overflow-hidden flex flex-col justify-between transition hover:border-[#d4af37]/60 hover:shadow-2xl duration-300 p-2.5 sm:p-3.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image & Overlay */}
      <div>
        <div className="relative aspect-[3/4] w-full bg-[#082816] rounded-xl overflow-hidden block">
          <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-[#d4af37]">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-700 ease-out ${
                isHovered ? "scale-105 opacity-90" : "scale-100 opacity-100"
              }`}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
            {cartItemCount > 0 && (
              <span className="bg-[#d4af37] text-black font-black text-[9px] sm:text-[10px] uppercase px-1.5 sm:px-2 py-0.5 rounded shadow flex items-center gap-1 border border-black/20">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                In Bag ({cartItemCount})
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-white text-black font-black text-[9px] sm:text-[10px] uppercase px-1.5 sm:px-2 py-0.5 rounded shadow">
                MANBRO New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-black/80 text-[#d4af37] border border-[#d4af37]/40 font-black text-[9px] sm:text-[10px] uppercase px-1.5 py-0.5 rounded shadow backdrop-blur-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#091D12]/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 border border-[#284234] z-10">
            <span className="text-[#d4af37]">★</span>
            <span>{product.rating || 4.8}</span>
          </div>

          {/* Desktop Hover Quick Add / Action Button */}
          <div className={`hidden md:block absolute inset-x-3 bottom-3 z-20 transition-[transform,opacity] duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}>
            <button
              type="button"
              aria-label={`Quick add ${product.name}${selectedSize ? `, size ${selectedSize}` : ""}`}
              onClick={() => {
                if (selectedSize && selectedColor) {
                  addToCart(product, selectedSize, selectedColor);
                }
              }}
              disabled={!selectedVariant}
              className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-lg shadow-xl transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] flex items-center justify-center gap-2 ${
                selectedVariant
                  ? "bg-[#d4af37] text-black hover:bg-[#c29e2e] cursor-pointer"
                  : "bg-[#091D12] text-neutral-500 border border-[#284234] cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {!selectedVariant
                ? "Select Options"
                : cartItemCount > 0
                ? `Add More (${cartItemCount})`
                : "Quick Add"}
            </button>
          </div>
        </div>

        {/* Details Container */}
        <div className="pt-2.5 sm:pt-3">
          <Link href={`/product/${product.slug}`} className="hover:text-[#d4af37] transition block mb-1">
            <h3 title={product.name} className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wide truncate">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-sm sm:text-base font-bold text-white">
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
            <div className="flex items-center gap-1.5 my-1.5">
              {product.colors.map((color) => {
                const hasStock = product.sizes?.some(size => isVariantInStock(size, color)) ?? true;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                    aria-pressed={selectedColor?.name === color.name}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition cursor-pointer ${
                      selectedColor?.name === color.name ? "border-[#d4af37] scale-125 ring-1 ring-[#d4af37]" : hasStock ? "border-neutral-600 opacity-70 hover:opacity-100" : "border-neutral-800 opacity-30 cursor-not-allowed"
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
      </div>

      {/* Mobile-Friendly Add To Bag Button (Always Visible on Mobile) */}
      <div className="md:hidden pt-2">
        <button
          type="button"
          onClick={() => {
            if (selectedSize && selectedColor) {
              addToCart(product, selectedSize, selectedColor);
            }
          }}
          disabled={!selectedVariant}
          className={`w-full py-2 px-2 rounded-lg font-black text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 active:scale-[0.98] ${
            selectedVariant
              ? "bg-[#d4af37] text-black hover:bg-[#c29e2e]"
              : "bg-[#091D12] text-neutral-500 border border-[#284234] cursor-not-allowed"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="truncate">
            {!selectedVariant ? "Sold Out" : cartItemCount > 0 ? `In Bag (${cartItemCount})` : "Add to Bag"}
          </span>
        </button>
      </div>
    </div>
  );
}
