"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { Product, ClothingSize, ColorOption } from "@/types/store";
import { useCart } from "@/components/cart/cart-context";
import { ProductCard } from "@/components/catalog/product-card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <ProductDetailContent key={resolvedParams.slug} slug={resolvedParams.slug} />;
}

function ProductDetailContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<ClothingSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeImageOverride, setActiveImageOverride] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "reviews">("details");

  // Variant stock management
  const getVariantStock = (size: ClothingSize, color: ColorOption) => {
    const variant = product?.variants.find(
      v => v.size === size && v.color.name === color.name
    );
    return variant ? variant.stock : 0;
  };

  const isVariantInStock = (size: ClothingSize, color: ColorOption) => {
    return getVariantStock(size, color) > 0;
  };

  const getVariantPrice = (size: ClothingSize, color: ColorOption) => {
    const variant = product?.variants.find(
      v => v.size === size && v.color.name === color.name
    );
    return variant?.price ?? product?.price ?? 0;
  };

  const { addToCart, cart } = useCart();
  const cartItemCount = product
    ? cart
        .filter((item) => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal).then((catalog) => {
      if (controller.signal.aborted) return;
      setProducts(catalog);
      const res = catalog.find((item) => item.slug === slug);
      if (res) {
        setProduct(res);
        const availableVariant = res.variants.find((variant) => variant.stock > 0);
        const initialColor = availableVariant?.color ?? res.colors[0] ?? null;
        setSelectedColor(initialColor);
        setSelectedSize(availableVariant?.size ?? res.sizes[0] ?? null);
        if (initialColor && res.colorImages?.[initialColor.name]) {
          setActiveImageOverride(res.colorImages[initialColor.name]);
        }
      }
    }).catch(() => {
      if (!controller.signal.aborted) setError("Product details could not be loaded. Please try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [slug, retry]);

  if (error) {
    return (
      <div role="alert" className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-neutral-300">{error}</p>
        <button
          type="button"
          onClick={() => { setError(""); setLoading(true); setRetry((value) => value + 1); }}
          className="px-5 py-2.5 bg-[#d4af37] text-black font-black text-xs rounded-lg hover:bg-[#c29e2e] active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Retry Product
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-400">Loading product details...</div>;
  }

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const displayImage =
    activeImageOverride ||
    (selectedColor ? product.colorImages?.[selectedColor.name] : undefined) ||
    product.images[activeImageIndex] ||
    product.images[0] ||
    "/images/products/tshirt-burgundy.jpg";

  const handleSelectColor = (color: ColorOption) => {
    setSelectedColor(color);
    if (product.colorImages?.[color.name]) {
      const colorImg = product.colorImages[color.name];
      setActiveImageOverride(colorImg);
      const foundIdx = product.images.findIndex((img) => img === colorImg);
      if (foundIdx !== -1) {
        setActiveImageIndex(foundIdx);
      }
    } else {
      setActiveImageOverride(null);
    }
  };

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white transition">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-white transition">{product.category}</Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#11301F] border border-[#284234] shadow-xl">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setActiveImageOverride(img);
                  }}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    displayImage === img
                      ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-105"
                      : "border-[#284234] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selection */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#d4af37]">
                  {product.category}
                </span>
                {product.productCode && (
                  <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 bg-[#11301F] border border-[#284234] px-2 py-0.5 rounded">
                    SKU: {product.productCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-white bg-[#11301F] border border-[#284234] px-2.5 py-1 rounded-full">
                <span className="text-[#d4af37]">★</span>
                <span>{product.rating}</span>
                <span className="text-neutral-400 text-[11px]">({product.reviewCount || 0})</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {product.name}
              </h1>
              {cartItemCount > 0 && (
                <span className="inline-flex self-start sm:self-auto bg-[#d4af37] text-black font-black text-[11px] sm:text-xs uppercase px-2.5 py-1 rounded-full shadow items-center gap-1 border border-black/20 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount} in Bag
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {selectedColor && selectedSize ? formatCurrency(getVariantPrice(selectedSize, selectedColor)) : formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm sm:text-base text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="text-xs font-bold text-[#d4af37] bg-[#11301F] px-2 py-0.5 rounded border border-[#284234]">
                GST Included (5%)
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          <hr className="border-[#284234]" />

          {/* Color Options */}
          {selectedColor && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                Color: <span className="text-white font-normal">{selectedColor.name}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {product.colors.map((color) => {
                  const hasStock = selectedSize && isVariantInStock(selectedSize, color);
                  const stock = selectedSize ? getVariantStock(selectedSize, color) : 0;
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleSelectColor(color)}
                      disabled={!hasStock}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        selectedColor.name === color.name
                          ? "border-[#d4af37] bg-[#11301F] text-white ring-1 ring-[#d4af37]"
                          : hasStock
                          ? "border-[#284234] text-neutral-300 hover:border-neutral-500 bg-[#091D12]"
                          : "border-[#284234] text-neutral-600 cursor-not-allowed bg-[#091D12]/50"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-neutral-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      {stock <= 5 && hasStock && (
                        <span className="text-[10px] text-orange-400">({stock} left)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Options */}
          {selectedSize && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-neutral-300">
                  Size: <span className="text-white font-normal">{selectedSize}</span>
                </label>
                <span className="text-neutral-400 text-[11px]">Regular Streetwear Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const hasStock = selectedColor && isVariantInStock(size, selectedColor);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!hasStock}
                      className={`w-11 sm:w-12 h-10 sm:h-11 rounded-lg border text-xs font-bold transition flex items-center justify-center ${
                        selectedSize === size
                          ? "bg-[#d4af37] text-black border-[#d4af37] shadow-lg"
                          : hasStock
                          ? "bg-[#11301F] text-neutral-300 border-[#284234] hover:border-neutral-400"
                          : "bg-[#091D12] text-neutral-600 border-[#284234] cursor-not-allowed opacity-40"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            {/* Quantity Counter */}
            <div className="flex items-center justify-between border border-[#284234] rounded-xl bg-[#11301F] px-4 py-3 sm:w-36">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="text-sm font-bold text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={() => {
                if (selectedColor && selectedSize && isVariantInStock(selectedSize, selectedColor)) {
                  const availableStock = getVariantStock(selectedSize, selectedColor);
                  if (quantity <= availableStock) {
                    addToCart(product, selectedSize, selectedColor, quantity);
                  } else {
                    toast.warning(`Only ${availableStock} items available in stock.`);
                  }
                }
              }}
              disabled={!selectedColor || !selectedSize || !isVariantInStock(selectedSize, selectedColor)}
              className={`flex-1 py-3.5 sm:py-4 px-6 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                selectedColor && selectedSize && isVariantInStock(selectedSize, selectedColor)
                  ? "bg-[#d4af37] text-black font-black hover:bg-[#c29e2e] shadow-[#d4af37]/20"
                  : "bg-[#284234] text-neutral-500 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {!selectedColor || !selectedSize || !isVariantInStock(selectedSize, selectedColor)
                ? "Out of Stock"
                : cartItemCount > 0
                ? `Add More (${cartItemCount} in Bag)`
                : "Add to Shopping Bag"}
            </button>
          </div>

          {/* Product Tabs (Details, Shipping) */}
          <div className="pt-4 border-t border-[#284234] space-y-4">
            <div className="flex border-b border-[#284234] gap-4 sm:gap-6 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-3 transition border-b-2 ${
                  activeTab === "details" ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Composition & Details
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-3 transition border-b-2 ${
                  activeTab === "shipping" ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            {activeTab === "details" ? (
              <ul className="space-y-2 text-xs text-neutral-300 list-disc list-inside leading-relaxed">
                {product.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-300 leading-relaxed">
                Free standard express shipping on orders of ₹999 or more. Orders placed before 2 PM IST ship same-day via India Post. 7-day hassle-free returns.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#284234] space-y-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
