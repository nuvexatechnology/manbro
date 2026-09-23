"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-context";
import { formatCurrency } from "@/lib/utils";
import { calculateTotals } from "@/lib/pricing";

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const totals = calculateTotals(subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#091D12] text-neutral-100 shadow-2xl border-l border-[#284234] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#284234] bg-[#11301F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">MANBRO Bag</h2>
              <span className="bg-[#d4af37] text-black text-xs px-2.5 py-0.5 rounded-full font-black">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-neutral-300 hover:text-[#d4af37] hover:bg-[#284234]/50 transition cursor-pointer"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-[#11301F] border-b border-[#284234]">
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-medium">
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-[#d4af37]">{formatCurrency(remainingForFreeShipping)}</strong> more for free express shipping!
                </span>
              ) : (
                <span className="text-[#d4af37] font-semibold flex items-center gap-1">
                  ✓ You&apos;ve unlocked Free Express Shipping!
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-[#091D12] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4af37] origin-left transition-transform duration-300"
                style={{ transform: `scaleX(${progressToFreeShipping / 100})` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#284234]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#11301F] border border-[#284234] flex items-center justify-center mb-4 text-[#d4af37]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-white font-bold text-base mb-1">Your MANBRO bag is empty</p>
                <p className="text-neutral-400 text-sm mb-6">Explore our luxury streetwear collection.</p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#d4af37] text-black text-sm font-black rounded-full hover:bg-[#c29e2e] transition cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 rounded-lg bg-[#082816] overflow-hidden shrink-0 border border-[#284234]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 title={item.product.name} className="text-sm font-medium text-white line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button
                          aria-label={`Remove ${item.product.name} from bag`}
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-400 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span>Size: <strong className="text-white">{item.selectedSize}</strong></span>
                        <span className="flex items-center gap-1">
                          Color:
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-600 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#284234] rounded-md bg-[#091D12]">
                        <button
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-neutral-300 hover:text-white text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-white">{item.quantity}</span>
                        <button
                          aria-label={`Increase quantity of ${item.product.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-neutral-300 hover:text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white">
                          {(() => {
                            const variant = item.product.variants.find(
                              v => v.size === item.selectedSize && v.color.name === item.selectedColor.name
                            );
                            const price = variant?.price ?? item.product.price;
                            return formatCurrency(price * item.quantity);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#11301F] border-t border-[#284234] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? <strong className="text-[#d4af37]">FREE</strong> : formatCurrency(totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#284234] flex justify-between text-base font-bold text-white">
                <span>Estimated Total</span>
                <span className="text-[#d4af37]">{formatCurrency(totals.total)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 px-4 bg-[#d4af37] text-black font-black text-center text-sm rounded-lg hover:bg-[#c29e2e] transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  Proceed to Checkout
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-2.5 text-center text-xs font-medium text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
