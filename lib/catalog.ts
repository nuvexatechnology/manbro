import type { FilterState, Product } from "@/types/store";

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const timeout = AbortSignal.timeout(15000);
  const response = await fetch("/api/products", {
    cache: "no-store",
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw new Error("Unable to load the catalog. Please try again.");

  const data = await response.json();
  if (data?.success !== true || !Array.isArray(data.products)) {
    throw new Error("Unable to load the catalog. Please try again.");
  }
  return data.products;
}

export async function getFeaturedProducts(signal?: AbortSignal): Promise<Product[]> {
  return (await getProducts(signal)).filter((product) => product.isFeatured);
}

export async function getProductBySlug(slug: string, signal?: AbortSignal): Promise<Product | undefined> {
  return (await getProducts(signal)).find((product) => product.slug === slug);
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    if (filters.category !== "All" && product.category !== filters.category) return false;

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(query) &&
          !product.description.toLowerCase().includes(query) &&
          !product.tags.some((tag) => tag.toLowerCase().includes(query))) return false;
    }

    if (filters.selectedSizes.length > 0 && !filters.selectedSizes.some((size) =>
      product.variants.some((variant) => variant.size === size && variant.stock > 0)
    )) return false;

    if (filters.selectedColors.length > 0 && !filters.selectedColors.some((color) =>
      product.variants.some((variant) =>
        variant.color.name.toLowerCase() === color.toLowerCase() && variant.stock > 0
      )
    )) return false;

    return product.price >= filters.minPrice && product.price <= filters.maxPrice;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": return Number(!!b.isNewArrival) - Number(!!a.isNewArrival);
      case "rating": return b.rating - a.rating;
      default: return Number(!!b.isFeatured) - Number(!!a.isFeatured);
    }
  });
}
