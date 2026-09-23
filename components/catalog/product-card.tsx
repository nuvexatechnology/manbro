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
  const { addToCart } = useCart();
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
      className="group relative bg-[#11301F]/80 border border-[#284234] rounded-2xl overflow-hidden flex flex-col transition hover:border-[#d4af37]/60 hover:shadow-2xl duration-300 p-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#082816] rounded-xl overflow-hidden block">
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-[#d4af37]">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out ${
              isHovered ? "scale-105 opacity-90" : "scale-100 opacity-100"
            }`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-[#d4af37] text-black font-black text-[10px] uppercase px-2 py-0.5 rounded shadow">
              MANBRO New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-black/80 text-[#d4af37] border border-[#d4af37]/40 font-black text-[10px] uppercase px-2 py-0.5 rounded shadow backdrop-blur-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-[#091D12]/80 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#284234] z-10">
          <span className="text-[#d4af37]">★</span>
          <span>{product.rating || 4.8}</span>
        </div>

        {/* Quick Add Overlay Button */}
        <div className={`absolute inset-x-3 bottom-3 z-20 transition-[transform,opacity] duration-300 md:focus-within:opacity-100 md:focus-within:translate-y-0 md:focus-within:pointer-events-auto ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-100 md:opacity-0 md:translate-y-2 md:pointer-events-none"
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
            {selectedVariant ? "Quick Add" : "Select Options"}
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="hover:text-[#d4af37] transition">
            <h3 title={product.name} className="text-sm font-bold text-[#d4af37] uppercase tracking-wide truncate mb-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Color Preview Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 my-2">
              {product.colors.map((color) => {
                const hasStock = product.sizes?.some(size => isVariantInStock(size, color)) ?? true;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                    aria-pressed={selectedColor?.name === color.name}
                    className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                      selectedColor?.name === color.name ? "border-[#d4af37] scale-125 ring-1 ring-[#d4af37]" : hasStock ? "border-neutral-600 opacity-70 hover:opacity-100" : "border-neutral-800 opacity-30 cursor-not-allowed"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    disabled={!hasStock}
                  />
                );
              })}
              <span className="text-[10px] text-neutral-400 ml-1">
                {product.colors.length} {product.colors.length === 1 ? "color" : "colors"}
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm sm:text-base font-bold text-white">
              {formatCurrency(selectedVariant?.price ?? product.price)}
            </span>
            <span className="text-xs text-neutral-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
            <span className="text-xs font-bold text-[#d4af37]">
              {discount}%OFF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
