"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, filterProducts } from "@/lib/catalog";
import { FilterState, ProductCategory, Product } from "@/types/store";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";

function ShopContent() {
  const searchParams = useSearchParams();

  const initialCategory = (searchParams.get("category") as ProductCategory) || "All";
  const initialSearch = searchParams.get("search") || "";

  return <ShopCatalog key={searchParams.toString()} initialCategory={initialCategory} initialSearch={initialSearch} />;
}

function ShopCatalog({ initialCategory, initialSearch }: { initialCategory: ProductCategory; initialSearch: string }) {
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    searchQuery: initialSearch,
    selectedSizes: [],
    selectedColors: [],
    minPrice: 0,
    maxPrice: 500,
    sortBy: "featured",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const filteredProducts = filterProducts(products, filters);

  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal).then((res) => {
      if (!controller.signal.aborted) setProducts(res);
    }).catch(() => {
      if (!controller.signal.aborted) setError("The catalog could not be loaded. Please try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [retry]);

  const handleResetFilters = () => {
    setFilters({
      category: "All",
      searchQuery: "",
      selectedSizes: [],
      selectedColors: [],
      minPrice: 0,
      maxPrice: 500,
      sortBy: "featured",
    });
  };

  return (
    <div className="min-h-screen bg-[#091D12] text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#284234] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Store Catalog
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Showing {filteredProducts.length} of {products.length} curated apparel pieces
          </p>
        </div>

        {/* Top Controls: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              aria-label="Search catalog"
              placeholder="Search catalog..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#11301F] border border-[#284234] text-white text-xs rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-400"
            />
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort By Selector */}
          <select
            aria-label="Sort products"
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState["sortBy"] }))}
            className="w-full sm:w-auto bg-[#11301F] border border-[#284234] text-white text-xs font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#d4af37] cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {error ? (
            <div role="alert" className="bg-[#11301F] border border-[#284234] rounded-2xl p-12 text-center space-y-4">
              <p className="text-sm text-neutral-300">{error}</p>
              <button
                type="button"
                onClick={() => { setError(""); setIsLoading(true); setRetry((value) => value + 1); }}
                className="px-5 py-2.5 bg-[#d4af37] text-black font-black text-xs rounded-lg hover:bg-[#c29e2e] active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
              >
                Retry Catalog
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-[#11301F] rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#091D12] border border-[#284234] mx-auto flex items-center justify-center text-[#d4af37]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No items match your current filter settings. Try adjusting price range or clearing size selections.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#d4af37] text-black font-black text-xs rounded-lg hover:bg-[#c29e2e] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-400 text-sm">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
