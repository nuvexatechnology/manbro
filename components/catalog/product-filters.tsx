"use client";

import React from "react";
import { FilterState, ProductCategory, ClothingSize } from "@/types/store";

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES: ProductCategory[] = ["All", "T-Shirts", "Hoodies"];
const SIZES: ClothingSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductFilters({ filters, onFilterChange, onReset }: ProductFiltersProps) {
  const handleCategoryClick = (cat: ProductCategory) => {
    onFilterChange({ ...filters, category: cat });
  };

  const handleSizeToggle = (size: ClothingSize) => {
    const exists = filters.selectedSizes.includes(size);
    const updated = exists
      ? filters.selectedSizes.filter((s) => s !== size)
      : [...filters.selectedSizes, size];
    onFilterChange({ ...filters, selectedSizes: updated });
  };

  return (
    <div className="bg-[#11301F]/80 border border-[#284234] rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#284234]">
        <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-neutral-300 hover:text-[#d4af37] transition font-medium cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-white block mb-3">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filters.category === cat
                  ? "bg-[#d4af37] text-black font-bold shadow"
                  : "bg-[#091D12] text-neutral-300 hover:text-white border border-[#284234]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-white">
            Price Range
          </label>
          <span className="text-xs text-[#d4af37] font-bold">
            ${filters.minPrice} - ${filters.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[#d4af37] cursor-pointer"
        />
      </div>

      {/* Size Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-white block mb-3">
          Sizes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => {
            const isSelected = filters.selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? "bg-[#d4af37] text-black border-[#d4af37]"
                    : "bg-[#091D12] text-neutral-300 border-[#284234] hover:border-[#d4af37]/50"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
