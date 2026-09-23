import { Product, ProductCategory, FilterState } from "@/types/store";

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Premium White Cotton T-Shirt",
    slug: "premium-white-cotton-tshirt",
    description: "Essential white t-shirt crafted from 100% premium cotton with a modern fit. Perfect for everyday wear and layering.",
    details: [
      "100% Premium Cotton",
      "Modern fit with tailored silhouette",
      "Reinforced collar and seams",
      "Pre-shrunk for consistent fit"
    ],
    price: 45,
    originalPrice: 60,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Gray", hex: "#808080" }
    ],
    variants: [
      { id: "var-1-1", size: "S", color: { name: "White", hex: "#FFFFFF" }, stock: 25 },
      { id: "var-1-2", size: "M", color: { name: "White", hex: "#FFFFFF" }, stock: 30 },
      { id: "var-1-3", size: "L", color: { name: "White", hex: "#FFFFFF" }, stock: 20 },
      { id: "var-1-4", size: "XL", color: { name: "White", hex: "#FFFFFF" }, stock: 15 },
      { id: "var-1-5", size: "XXL", color: { name: "White", hex: "#FFFFFF" }, stock: 10 },
      { id: "var-1-6", size: "S", color: { name: "Black", hex: "#1A1A1A" }, stock: 20 },
      { id: "var-1-7", size: "M", color: { name: "Black", hex: "#1A1A1A" }, stock: 25 },
      { id: "var-1-8", size: "L", color: { name: "Black", hex: "#1A1A1A" }, stock: 18 },
      { id: "var-1-9", size: "XL", color: { name: "Black", hex: "#1A1A1A" }, stock: 12 },
      { id: "var-1-10", size: "S", color: { name: "Gray", hex: "#808080" }, stock: 15 },
      { id: "var-1-11", size: "M", color: { name: "Gray", hex: "#808080" }, stock: 20 },
      { id: "var-1-12", size: "L", color: { name: "Gray", hex: "#808080" }, stock: 10 },
    ],
    images: [
      "/images/products/linen-shirt.jpg"
    ],
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    isNewArrival: true,
    inStock: true,
    tags: ["tshirt", "cotton", "basic", "everyday"]
  },
  {
    id: "prod-2",
    name: "Heavyweight Streetwear Hoodie",
    slug: "heavyweight-streetwear-hoodie",
    description: "An essential 450GSM French terry cotton hoodie featuring a clean boxy silhouette, double-layered hood, and minimal branding.",
    details: [
      "450 GSM 100% Cotton French Terry",
      "Pre-shrunk custom drop-shoulder fit",
      "Double-lined hood without drawstrings",
      "Ribbed cuffs and hem"
    ],
    price: 110,
    originalPrice: 135,
    category: "Hoodies",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Onyx Black", hex: "#1A1A1A" },
      { name: "Heather Grey", hex: "#A0AEC0" },
      { name: "White", hex: "#FFFFFF" }
    ],
    variants: [
      { id: "var-2-1", size: "XS", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 8 },
      { id: "var-2-2", size: "S", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-2-3", size: "M", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 20 },
      { id: "var-2-4", size: "L", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 18 },
      { id: "var-2-5", size: "XL", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 12 },
      { id: "var-2-6", size: "XXL", color: { name: "Onyx Black", hex: "#1A1A1A" }, stock: 5 },
      { id: "var-2-7", size: "S", color: { name: "Heather Grey", hex: "#A0AEC0" }, stock: 12 },
      { id: "var-2-8", size: "M", color: { name: "Heather Grey", hex: "#A0AEC0" }, stock: 15 },
      { id: "var-2-9", size: "L", color: { name: "Heather Grey", hex: "#A0AEC0" }, stock: 10 },
      { id: "var-2-10", size: "S", color: { name: "White", hex: "#FFFFFF" }, stock: 10 },
      { id: "var-2-11", size: "M", color: { name: "White", hex: "#FFFFFF" }, stock: 12 },
      { id: "var-2-12", size: "L", color: { name: "White", hex: "#FFFFFF" }, stock: 8 },
    ],
    images: [
      "/images/products/hoodie.jpg"
    ],
    rating: 4.9,
    reviewCount: 88,
    isFeatured: true,
    isNewArrival: false,
    inStock: true,
    tags: ["hoodie", "streetwear", "heavyweight", "cotton"]
  },
  {
    id: "prod-3",
    name: "Graphic Print Oversized T-Shirt",
    slug: "graphic-print-oversized-tshirt",
    description: "Bold oversized t-shirt with premium graphic print. Made from heavyweight cotton for durability and comfort.",
    details: [
      "280 GSM Heavyweight Cotton",
      "Oversized relaxed fit",
      "Premium screen print graphics",
      "Double-stitched hems"
    ],
    price: 55,
    originalPrice: 75,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Navy", hex: "#000080" }
    ],
    variants: [
      { id: "var-3-1", size: "S", color: { name: "Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-3-2", size: "M", color: { name: "Black", hex: "#1A1A1A" }, stock: 20 },
      { id: "var-3-3", size: "L", color: { name: "Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-3-4", size: "XL", color: { name: "Black", hex: "#1A1A1A" }, stock: 10 },
      { id: "var-3-5", size: "S", color: { name: "Navy", hex: "#000080" }, stock: 12 },
      { id: "var-3-6", size: "M", color: { name: "Navy", hex: "#000080" }, stock: 18 },
      { id: "var-3-7", size: "L", color: { name: "Navy", hex: "#000080" }, stock: 12 },
      { id: "var-3-8", size: "XL", color: { name: "Navy", hex: "#000080" }, stock: 8 },
    ],
    images: [
      "/images/products/linen-shirt.jpg"
    ],
    rating: 4.7,
    reviewCount: 67,
    isFeatured: true,
    isNewArrival: true,
    inStock: true,
    tags: ["tshirt", "graphic", "oversized", "streetwear"]
  },
  {
    id: "prod-4",
    name: "Zip-Up Performance Hoodie",
    slug: "zip-up-performance-hoodie",
    description: "Athletic zip-up hoodie with moisture-wicking fabric and comfortable stretch. Perfect for workouts and casual wear.",
    details: [
      "Performance polyester-cotton blend",
      "Moisture-wicking technology",
      "Full zip front with stand collar",
      "Side pockets with zipper closure"
    ],
    price: 95,
    originalPrice: 120,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Gray", hex: "#808080" },
      { name: "Navy", hex: "#000080" }
    ],
    variants: [
      { id: "var-4-1", size: "S", color: { name: "Black", hex: "#1A1A1A" }, stock: 10 },
      { id: "var-4-2", size: "M", color: { name: "Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-4-3", size: "L", color: { name: "Black", hex: "#1A1A1A" }, stock: 12 },
      { id: "var-4-4", size: "XL", color: { name: "Black", hex: "#1A1A1A" }, stock: 8 },
      { id: "var-4-5", size: "XXL", color: { name: "Black", hex: "#1A1A1A" }, stock: 5 },
      { id: "var-4-6", size: "S", color: { name: "Gray", hex: "#808080" }, stock: 8 },
      { id: "var-4-7", size: "M", color: { name: "Gray", hex: "#808080" }, stock: 12 },
      { id: "var-4-8", size: "L", color: { name: "Gray", hex: "#808080" }, stock: 10 },
      { id: "var-4-9", size: "S", color: { name: "Navy", hex: "#000080" }, stock: 6 },
      { id: "var-4-10", size: "M", color: { name: "Navy", hex: "#000080" }, stock: 10 },
      { id: "var-4-11", size: "L", color: { name: "Navy", hex: "#000080" }, stock: 8 },
    ],
    images: [
      "/images/products/hoodie.jpg"
    ],
    rating: 4.6,
    reviewCount: 45,
    isFeatured: false,
    isNewArrival: true,
    inStock: true,
    tags: ["hoodie", "zip", "performance", "athletic"]
  },
  {
    id: "prod-5",
    name: "Vintage Wash T-Shirt",
    slug: "vintage-wash-tshirt",
    description: "Soft vintage-washed t-shirt with lived-in comfort and timeless style. Each piece has unique character.",
    details: [
      "100% Cotton with enzyme wash",
      "Vintage washed for soft feel",
      "Relaxed fit",
      "Garment-dyed for unique color"
    ],
    price: 48,
    originalPrice: 65,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Vintage White", hex: "#F5F5DC" },
      { name: "Indigo", hex: "#4B0082" },
      { name: "Rust", hex: "#8B4513" }
    ],
    variants: [
      { id: "var-5-1", size: "S", color: { name: "Vintage White", hex: "#F5F5DC" }, stock: 12 },
      { id: "var-5-2", size: "M", color: { name: "Vintage White", hex: "#F5F5DC" }, stock: 15 },
      { id: "var-5-3", size: "L", color: { name: "Vintage White", hex: "#F5F5DC" }, stock: 10 },
      { id: "var-5-4", size: "XL", color: { name: "Vintage White", hex: "#F5F5DC" }, stock: 8 },
      { id: "var-5-5", size: "S", color: { name: "Indigo", hex: "#4B0082" }, stock: 8 },
      { id: "var-5-6", size: "M", color: { name: "Indigo", hex: "#4B0082" }, stock: 12 },
      { id: "var-5-7", size: "L", color: { name: "Indigo", hex: "#4B0082" }, stock: 10 },
      { id: "var-5-8", size: "S", color: { name: "Rust", hex: "#8B4513" }, stock: 6 },
      { id: "var-5-9", size: "M", color: { name: "Rust", hex: "#8B4513" }, stock: 10 },
      { id: "var-5-10", size: "L", color: { name: "Rust", hex: "#8B4513" }, stock: 8 },
    ],
    images: [
      "/images/products/linen-shirt.jpg"
    ],
    rating: 4.8,
    reviewCount: 89,
    isFeatured: false,
    isNewArrival: false,
    inStock: true,
    tags: ["tshirt", "vintage", "washed", "casual"]
  },
  {
    id: "prod-6",
    name: "Pullover Fleece Hoodie",
    slug: "pullover-fleece-hoodie",
    description: "Cozy pullover hoodie with soft fleece interior. Classic design with kangaroo pocket and adjustable hood.",
    details: [
      "Soft fleece interior",
      "Classic pullover design",
      "Kangaroo front pocket",
      "Adjustable drawstring hood"
    ],
    price: 85,
    originalPrice: 100,
    category: "Hoodies",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Gray", hex: "#808080" },
      { name: "Navy", hex: "#000080" }
    ],
    variants: [
      { id: "var-6-1", size: "XS", color: { name: "Black", hex: "#1A1A1A" }, stock: 5 },
      { id: "var-6-2", size: "S", color: { name: "Black", hex: "#1A1A1A" }, stock: 12 },
      { id: "var-6-3", size: "M", color: { name: "Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-6-4", size: "L", color: { name: "Black", hex: "#1A1A1A" }, stock: 12 },
      { id: "var-6-5", size: "XL", color: { name: "Black", hex: "#1A1A1A" }, stock: 8 },
      { id: "var-6-6", size: "S", color: { name: "Gray", hex: "#808080" }, stock: 10 },
      { id: "var-6-7", size: "M", color: { name: "Gray", hex: "#808080" }, stock: 12 },
      { id: "var-6-8", size: "L", color: { name: "Gray", hex: "#808080" }, stock: 8 },
      { id: "var-6-9", size: "S", color: { name: "Navy", hex: "#000080" }, stock: 6 },
      { id: "var-6-10", size: "M", color: { name: "Navy", hex: "#000080" }, stock: 10 },
      { id: "var-6-11", size: "L", color: { name: "Navy", hex: "#000080" }, stock: 8 },
    ],
    images: [
      "/images/products/hoodie.jpg"
    ],
    rating: 4.7,
    reviewCount: 56,
    isFeatured: true,
    isNewArrival: false,
    inStock: true,
    tags: ["hoodie", "fleece", "pullover", "cozy"]
  },
  {
    id: "prod-7",
    name: "Essential Black Cotton Tee",
    slug: "essential-black-cotton-tee",
    description: "A premium heavyweight black t-shirt crafted from 100% organic cotton. Minimalist design with a structured fit that pairs with everything.",
    details: [
      "220 GSM 100% Organic Cotton",
      "Regular structured fit",
      "Reinforced crew neck",
      "Pre-shrunk fabric",
      "Side-seamed construction"
    ],
    price: 52,
    originalPrice: 70,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Charcoal", hex: "#36454F" }
    ],
    variants: [
      { id: "var-7-1", size: "S", color: { name: "Black", hex: "#1A1A1A" }, stock: 20 },
      { id: "var-7-2", size: "M", color: { name: "Black", hex: "#1A1A1A" }, stock: 30 },
      { id: "var-7-3", size: "L", color: { name: "Black", hex: "#1A1A1A" }, stock: 25 },
      { id: "var-7-4", size: "XL", color: { name: "Black", hex: "#1A1A1A" }, stock: 15 },
      { id: "var-7-5", size: "XXL", color: { name: "Black", hex: "#1A1A1A" }, stock: 10 },
      { id: "var-7-6", size: "S", color: { name: "White", hex: "#FFFFFF" }, stock: 15 },
      { id: "var-7-7", size: "M", color: { name: "White", hex: "#FFFFFF" }, stock: 20 },
      { id: "var-7-8", size: "L", color: { name: "White", hex: "#FFFFFF" }, stock: 18 },
      { id: "var-7-9", size: "XL", color: { name: "White", hex: "#FFFFFF" }, stock: 12 },
      { id: "var-7-10", size: "S", color: { name: "Charcoal", hex: "#36454F" }, stock: 12 },
      { id: "var-7-11", size: "M", color: { name: "Charcoal", hex: "#36454F" }, stock: 18 },
      { id: "var-7-12", size: "L", color: { name: "Charcoal", hex: "#36454F" }, stock: 15 },
      { id: "var-7-13", size: "XL", color: { name: "Charcoal", hex: "#36454F" }, stock: 10 },
    ],
    images: [
      "/images/products/linen-shirt.jpg"
    ],
    colorImages: {
      "Black": "/images/products/blazer.jpg",
      "White": "/images/products/linen-shirt.jpg",
      "Charcoal": "/images/products/hoodie.jpg"
    },
    rating: 4.9,
    reviewCount: 34,
    isFeatured: true,
    isNewArrival: true,
    inStock: true,
    tags: ["tshirt", "black", "cotton", "essential", "minimal"]
  }
];

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.slug === slug);
}

export async function filterProducts(filters: FilterState): Promise<Product[]> {
  return PRODUCTS.filter((product) => {
    // Category Filter
    if (filters.category !== "All" && product.category !== filters.category) {
      return false;
    }

    // Search Query Filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(q);
      const matchesDesc = product.description.toLowerCase().includes(q);
      const matchesTags = product.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesName && !matchesDesc && !matchesTags) return false;
    }

    // Size Filter - check if product has any variant with selected size in stock
    if (filters.selectedSizes.length > 0) {
      const hasSize = filters.selectedSizes.some((size) =>
        product.variants.some((v) => v.size === size && v.stock > 0)
      );
      if (!hasSize) return false;
    }

    // Color Filter - check if product has any variant with selected color in stock
    if (filters.selectedColors.length > 0) {
      const hasColor = filters.selectedColors.some((color) =>
        product.variants.some((v) => 
          v.color.name.toLowerCase() === color.toLowerCase() && v.stock > 0
        )
      );
      if (!hasColor) return false;
    }

    // Price Filter - use base price (variant prices are optional overrides)
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      case "rating":
        return b.rating - a.rating;
      case "featured":
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });
}
