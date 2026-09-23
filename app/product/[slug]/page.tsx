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

  const { addToCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal).then((catalog) => {
      if (controller.signal.aborted) return;
      setProducts(catalog);
      const res = catalog.find((item) => item.slug === slug);
      if (res) {
        setProduct(res);
        const availableVariant = res.variants.find((variant) => variant.stock > 0);
        setSelectedColor(availableVariant?.color ?? res.colors[0] ?? null);
        setSelectedSize(availableVariant?.size ?? res.sizes[0] ?? null);
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

  const colorImage = selectedColor ? product.colorImages?.[selectedColor.name] : undefined;
  const displayImage = colorImage || product.images[activeImageIndex] || product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#11301F] border border-[#284234]">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition ${
                    activeImageIndex === idx ? "border-white" : "border-[#284234] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selection */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d4af37]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-white bg-[#11301F] border border-[#284234] px-3 py-1 rounded-full">
                <span className="text-white">★</span>
                <span>{product.rating}</span>
                <span className="text-neutral-500">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-white">
                {selectedColor && selectedSize ? formatCurrency(getVariantPrice(selectedSize, selectedColor)) : formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          <hr className="border-[#284234]" />

          {/* Color Options */}
          {selectedColor && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                Color: <span className="text-white font-normal">{selectedColor.name}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => {
                  const hasStock = selectedSize && isVariantInStock(selectedSize, color);
                  const stock = selectedSize ? getVariantStock(selectedSize, color) : 0;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      disabled={!hasStock}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        selectedColor.name === color.name
                          ? "border-white bg-[#11301F] text-white"
                          : hasStock
                          ? "border-[#284234] text-neutral-400 hover:border-[#284234]"
                          : "border-[#284234] text-neutral-600 cursor-not-allowed"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-neutral-700"
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
                <a href="#" className="text-neutral-400 underline hover:text-white">Size Guide</a>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const hasStock = selectedColor && isVariantInStock(size, selectedColor);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!hasStock}
                      className={`w-12 h-11 rounded-lg border text-xs font-bold transition flex items-center justify-center ${
                        selectedSize === size
                          ? "bg-[#d4af37] text-black border-[#d4af37] shadow-lg"
                          : hasStock
                          ? "bg-[#11301F] text-neutral-300 border-[#284234] hover:border-[#284234]"
                          : "bg-[#091D12] text-neutral-600 border-[#284234] cursor-not-allowed"
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            {/* Quantity Counter */}
            <div className="flex items-center justify-between border border-[#284234] rounded-lg bg-[#11301F] px-4 py-3 sm:w-36">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-neutral-400 hover:text-white font-bold text-base px-1"
              >
                -
              </button>
              <span className="text-sm font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="text-neutral-400 hover:text-white font-bold text-base px-1"
              >
                +
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={() => {
                if (selectedColor && selectedSize && isVariantInStock(selectedSize, selectedColor)) {
                  // Check if quantity exceeds available stock
                  const availableStock = getVariantStock(selectedSize, selectedColor);
                  if (quantity <= availableStock) {
                    addToCart(product, selectedSize, selectedColor, quantity);
                  } else {
                    alert(`Only ${availableStock} items available in stock.`);
                  }
                }
              }}
              disabled={!selectedColor || !selectedSize || !isVariantInStock(selectedSize, selectedColor)}
              className={`flex-1 py-4 px-6 font-extrabold text-sm uppercase tracking-wider rounded-lg shadow-xl transition flex items-center justify-center gap-2 ${
                selectedColor && selectedSize && isVariantInStock(selectedSize, selectedColor)
                  ? "bg-[#d4af37] text-black font-black hover:bg-[#c29e2e]"
                  : "bg-[#284234] text-neutral-500 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {selectedColor && selectedSize && isVariantInStock(selectedSize, selectedColor)
                ? "Add to Shopping Bag"
                : "Out of Stock"}
            </button>
          </div>

          {/* Product Tabs (Details, Shipping) */}
          <div className="pt-6 border-t border-[#284234] space-y-4">
            <div className="flex border-b border-[#284234] gap-6 text-xs font-bold uppercase tracking-wider">
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
                Free standard express shipping on orders of $150 or more. Orders placed before 2 PM EST ship same-day. 30-day hassle-free returns.
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
