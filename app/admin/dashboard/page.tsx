"use client";

import React, { useState, useEffect, useEffectEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Order, Product, Category } from "@/types/store";
import { getAdminOrdersAction } from "@/actions/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/auth/client";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "categories">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadDashboardData = async () => {
    try {
      // Load orders
      const ordersRes = await getAdminOrdersAction();
      if (ordersRes.success && ordersRes.orders) {
        setOrders(ordersRes.orders);
      }

      // Load products
      const productsRes = await adminFetch("/api/admin/products");
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.products);
      }

      // Load categories
      const categoriesRes = await adminFetch("/api/admin/categories");
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = useEffectEvent(loadDashboardData);

  useEffect(() => {
    const controller = new AbortController();
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok || data.authenticated !== true) {
          router.replace("/admin/login");
          return;
        }
        setIsAuthenticated(true);
        await loadInitialData();
      } catch {
        if (!controller.signal.aborted) router.replace("/admin/login");
      }
    };
    void checkSession();
    return () => controller.abort();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Logout failed");
      setIsAuthenticated(false);
      router.replace("/admin/login");
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      const response = await adminFetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (data.success) {
        setShowProductForm(false);
        await loadDashboardData();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to add product" };
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      return { success: false, error: error?.message || "Network error adding product" };
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    try {
      const response = await adminFetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...productData, id: editingProduct?.id, version: editingProduct?.version }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingProduct(null);
        setShowProductForm(false);
        await loadDashboardData();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to update product" };
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      return { success: false, error: error?.message || "Network error updating product" };
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await adminFetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      const response = await adminFetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCategoryForm(false);
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    try {
      const response = await adminFetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...categoryData, id: editingCategory?.id }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingCategory(null);
        setShowCategoryForm(false);
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await adminFetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#091D12] text-white">
      {/* Admin Header */}
      <header className="bg-[#091D12] border-b border-[#284234] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center group">
              <div className="relative h-7 w-[180px] shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo-full.png"
                  alt="MANBRO"
                  width={180}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <span className="text-[10px] uppercase font-bold text-[#d4af37] border border-[#d4af37]/40 bg-[#11301F] px-2.5 py-0.5 rounded-full">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-300 hover:text-[#d4af37] transition font-medium"
            >
              View Live Store ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#11301F] border border-[#284234] hover:border-red-500/50 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#11301F] p-1.5 rounded-2xl border border-[#284234] mb-8">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "orders", label: `📦 Orders (${orders.length})` },
            { id: "products", label: `👕 Products (${products.length})` },
            { id: "categories", label: `🏷️ Categories (${categories.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#d4af37] text-black font-extrabold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-300 hover:text-white hover:bg-[#284234]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Performance Overview
            </h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">Total Orders</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{orders.length}</div>
                <div className="text-xs text-neutral-400 mt-2">All time customer orders</div>
              </div>

              <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">Total Revenue</div>
                <div className="text-3xl sm:text-4xl font-black text-[#d4af37]">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
                </div>
                <div className="text-xs text-neutral-400 mt-2">Gross order volume</div>
              </div>

              <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">Total Products</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{products.length}</div>
                <div className="text-xs text-neutral-400 mt-2">Active catalog items</div>
              </div>

              <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">Categories</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{categories.length}</div>
                <div className="text-xs text-neutral-400 mt-2">Apparel classifications</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Recent Orders</h3>
                <Link href="/admin" className="text-xs text-[#d4af37] hover:underline font-semibold">
                  Manage in Order Desk →
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-neutral-400">No customer orders recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#091D12] border border-[#284234] rounded-xl gap-2 hover:border-[#d4af37]/40 transition"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#d4af37]">{order.id}</div>
                        <div className="text-xs text-neutral-300">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName} • {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <div className="text-sm font-bold text-white">{formatCurrency(order.total)}</div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                              : order.status === "SHIPPED"
                              ? "bg-blue-950/80 text-blue-400 border border-blue-800/50"
                              : order.status === "CANCELLED"
                              ? "bg-red-950/80 text-red-400 border border-red-800/50"
                              : "bg-amber-950/80 text-[#d4af37] border border-amber-800/50"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Order Management</h2>
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Open Order Desk & India Post Dispatch →
              </Link>
            </div>
            
            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8">
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#091D12] border border-[#284234] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#d4af37]">{order.id}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
                              : order.status === "SHIPPED"
                              ? "bg-blue-950/80 text-blue-400 border-blue-800/50"
                              : order.status === "CANCELLED"
                              ? "bg-red-950/80 text-red-400 border-red-800/50"
                              : "bg-amber-950/80 text-[#d4af37] border-amber-800/50"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName} ({order.shippingAddress.phone}) • {formatDate(order.createdAt)}
                      </p>
                      {order.trackingInfo?.trackingNumber && (
                        <p className="text-[11px] text-[#d4af37] font-mono mt-1">
                          India Post: {order.trackingInfo.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 justify-between md:justify-end">
                      <span className="text-sm font-bold text-white">{formatCurrency(order.total)}</span>
                      <Link
                        href="/admin"
                        className="px-3 py-1.5 bg-[#11301F] border border-[#284234] hover:border-[#d4af37] text-xs text-white rounded-lg transition"
                      >
                        Manage Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Product Management</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-[#d4af37]/10"
              >
                + Add Product
              </button>
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            )}

            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-[#091D12] border border-[#284234] rounded-xl hover:border-[#284234]/80 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-16 bg-[#11301F] border border-[#284234] rounded-lg overflow-hidden shrink-0">
                        <img src={product.images[0] || "/images/products/tshirt-burgundy.jpg"} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#d4af37] uppercase">{product.name}</div>
                        <div className="text-xs text-neutral-300">{product.category} • {formatCurrency(product.price)}</div>
                        <div className="text-xs text-neutral-400 mt-1">
                          {product.variants.length} variants • {product.variants.reduce((sum, v) => sum + v.stock, 0)} total stock
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#11301F] border border-[#284234] text-white text-xs font-semibold rounded-lg hover:border-[#d4af37] hover:text-[#d4af37] transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3.5 py-1.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-900/50 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Category Management</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-[#d4af37]/10"
              >
                + Add Category
              </button>
            </div>

            {showCategoryForm && (
              <CategoryForm
                category={editingCategory}
                onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
                onCancel={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              />
            )}

            <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-[#091D12] border border-[#284234] rounded-xl hover:border-[#284234]/80 transition">
                    <div>
                      <div className="text-sm font-bold text-[#d4af37] uppercase">{category.name}</div>
                      <div className="text-xs text-neutral-300">{category.slug} {category.description ? `• ${category.description}` : ""}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#11301F] border border-[#284234] text-white text-xs font-semibold rounded-lg hover:border-[#d4af37] hover:text-[#d4af37] transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-3.5 py-1.5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-900/50 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to keep variants synchronized with sizes and colors
function syncVariants(
  currentVariants: any[],
  sizes: string[],
  colors: { name: string; hex: string }[]
) {
  const result: any[] = [];
  let idCounter = 0;
  for (const s of sizes) {
    for (const c of colors) {
      const match = (currentVariants || []).find(
        (v: any) =>
          v.size === s &&
          v.color &&
          v.color.name.toLowerCase().trim() === c.name.toLowerCase().trim()
      );
      if (match) {
        result.push({
          id: match.id || `var-${Date.now()}-${idCounter++}`,
          size: s,
          color: { name: c.name.trim(), hex: c.hex.trim() },
          stock: typeof match.stock === "number" ? match.stock : parseInt(match.stock, 10) || 10,
          price: match.price !== undefined && match.price !== "" ? Number(match.price) : undefined,
        });
      } else {
        result.push({
          id: `var-${Date.now()}-${idCounter++}`,
          size: s,
          color: { name: c.name.trim(), hex: c.hex.trim() },
          stock: 10,
          price: undefined,
        });
      }
    }
  }
  return result;
}

// Product Form Component
function ProductForm({ product, categories, onSubmit, onCancel }: any) {
  const initialSizes = product?.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  const initialColors = product?.colors?.length ? product.colors : [{ name: "Black", hex: "#091D12" }];
  const initialVariants = syncVariants(product?.variants || [], initialSizes, initialColors);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price != null ? String(product.price) : "",
    originalPrice: product?.originalPrice != null ? String(product.originalPrice) : "",
    category: product?.category || (categories?.[0]?.name || "T-Shirts"),
    sizes: initialSizes,
    colors: initialColors,
    images: product?.images?.join(", ") || "/images/products/tshirt-burgundy.jpg",
    colorImages: product?.colorImages || {},
    variants: initialVariants,
  });

  const [step, setStep] = useState(1);
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-slugify helper
  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");
    
    const prevAutoSlug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    setFormData((prev: any) => ({
      ...prev,
      name,
      slug: (!prev.slug || prev.slug === prevAutoSlug) ? autoSlug : prev.slug,
    }));
  };

  const handleSizeToggle = (sizeOption: string) => {
    const newSizes = formData.sizes.includes(sizeOption)
      ? formData.sizes.filter((s: string) => s !== sizeOption)
      : [...formData.sizes, sizeOption];
    if (newSizes.length === 0) return; // keep at least 1 size
    const newVariants = syncVariants(formData.variants, newSizes, formData.colors);
    setFormData((prev: any) => ({ ...prev, sizes: newSizes, variants: newVariants }));
  };

  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    const exists = formData.colors.some(
      (c: any) => c.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (exists) return;
    const newColors = [...formData.colors, { name: preset.name, hex: preset.hex }];
    const newVariants = syncVariants(formData.variants, formData.sizes, newColors);
    setFormData((prev: any) => ({ ...prev, colors: newColors, variants: newVariants }));
  };

  const handleCustomColorChange = (index: number, updatedColor: any) => {
    const newColors = [...formData.colors];
    newColors[index] = updatedColor;
    const newVariants = syncVariants(formData.variants, formData.sizes, newColors);
    setFormData((prev: any) => ({ ...prev, colors: newColors, variants: newVariants }));
  };

  const handleRemoveColor = (index: number) => {
    if (formData.colors.length <= 1) return;
    const newColors = formData.colors.filter((_: any, i: number) => i !== index);
    const newVariants = syncVariants(formData.variants, formData.sizes, newColors);
    setFormData((prev: any) => ({ ...prev, colors: newColors, variants: newVariants }));
  };

  const updateVariantStock = (variantId: string, stock: number) => {
    const updatedVariants = formData.variants.map((v: any) =>
      v.id === variantId ? { ...v, stock: Math.max(0, Number(stock) || 0) } : v
    );
    setFormData({ ...formData, variants: updatedVariants });
  };

  const updateVariantPrice = (variantId: string, price: string) => {
    const updatedVariants = formData.variants.map((v: any) =>
      v.id === variantId ? { ...v, price: price ? Number(price) : undefined } : v
    );
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Please enter a product name.");
      setStep(1);
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage("Please enter a valid base price (₹0 or greater).");
      setStep(1);
      return;
    }

    const cleanSlug = (formData.slug.trim() || formData.name.trim())
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "") || `product-${Date.now()}`;

    const cleanImages = formData.images
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (cleanImages.length === 0) {
      cleanImages.push("/images/products/tshirt-burgundy.jpg");
    }

    const colorImagesCleaned: Record<string, string> = {};
    for (const [key, val] of Object.entries(formData.colorImages)) {
      if (typeof val === "string" && val.trim()) {
        const trimmed = val.trim();
        colorImagesCleaned[key.trim()] = trimmed.startsWith("/") || trimmed.startsWith("http") ? trimmed : `/${trimmed}`;
      }
    }

    const finalVariants = syncVariants(formData.variants, formData.sizes, formData.colors);

    const payload = {
      name: formData.name.trim(),
      slug: cleanSlug,
      description: formData.description.trim(),
      price: priceNum,
      originalPrice: formData.originalPrice && !isNaN(parseFloat(formData.originalPrice)) && parseFloat(formData.originalPrice) > 0
        ? parseFloat(formData.originalPrice)
        : undefined,
      category: formData.category || "T-Shirts",
      sizes: formData.sizes,
      colors: formData.colors,
      images: cleanImages,
      colorImages: Object.keys(colorImagesCleaned).length > 0 ? colorImagesCleaned : undefined,
      variants: finalVariants,
    };

    setIsSubmitting(true);
    try {
      const res = await onSubmit(payload);
      if (res && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred saving product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryList = categories && categories.length > 0
    ? categories
    : [{ id: "t-shirts", name: "T-Shirts" }, { id: "shirts", name: "Shirts" }, { id: "pants", name: "Pants" }, { id: "accessories", name: "Accessories" }];

  return (
    <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-[#d4af37] uppercase tracking-wide">
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-neutral-400 hover:text-white"
        >
          ✕ Close
        </button>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs font-semibold flex items-start gap-3 shadow-lg">
          <span className="text-lg leading-none">⚠️</span>
          <div className="flex-1">
            <div className="font-bold text-red-300 mb-0.5">Could not save product:</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}
      
      {/* Step Indicator */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition ${
              step === s ? "text-[#d4af37]" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${
              step >= s ? "bg-[#d4af37] text-black" : "bg-[#091D12] border border-[#284234] text-neutral-500"
            }`}>
              {s}
            </div>
            <span>
              {s === 1 ? "Basic Info" : s === 2 ? "Sizes & Colors" : "Variants & Stock"}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Classic Luxury Polo"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. classic-luxury-polo"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="999"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Original / Strikethrough Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="1499 (optional)"
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-neutral-300 block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none cursor-pointer"
                  required
                >
                  {categoryList.map((cat: any) => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description and fabric details..."
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">Image URLs (comma-separated)</label>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="/images/products/tshirt-burgundy.jpg"
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Color-based Images */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">Color Specific Images</label>
              <div className="space-y-2">
                {formData.colors.map((color: any) => (
                  <div key={color.name} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewColor(previewColor === color.name ? null : color.name)}
                      className={`w-8 h-8 rounded-lg border-2 transition flex-shrink-0 cursor-pointer ${
                        previewColor === color.name ? "border-[#d4af37] scale-110" : "border-[#284234] hover:border-[#d4af37]"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`Preview ${color.name}`}
                    />
                    <span className="text-xs text-neutral-300 w-24 truncate">{color.name}</span>
                    <input
                      type="text"
                      value={formData.colorImages[color.name] || ""}
                      onChange={(e) => {
                        const newColorImages = { ...formData.colorImages, [color.name]: e.target.value };
                        setFormData({ ...formData, colorImages: newColorImages });
                      }}
                      placeholder={`/images/products/${color.name.toLowerCase()}.jpg`}
                      className="flex-1 bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                ))}
              </div>
              {previewColor && formData.colorImages[previewColor] && (
                <div className="mt-3 relative w-40 h-52 rounded-xl overflow-hidden border border-[#284234] bg-[#091D12]">
                  <img
                    src={formData.colorImages[previewColor]}
                    alt={`Preview: ${previewColor}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#091D12]/90 text-[#d4af37] px-2 py-0.5 rounded border border-[#284234]">
                    {previewColor}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#284234]">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-[#091D12] border border-[#284234] text-neutral-300 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-[#11301F] border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Quick Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Next: Sizes & Colors →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sizes and Colors */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">Available Sizes (Select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      formData.sizes.includes(size)
                        ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/20"
                        : "bg-[#091D12] border-[#284234] text-neutral-300 hover:border-[#d4af37]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">Available Colors</label>
              
              {/* Preset Color Palette */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-2">Quick Add Preset</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Black", hex: "#091D12" },
                    { name: "Gold", hex: "#d4af37" },
                    { name: "Forest Green", hex: "#11301F" },
                    { name: "White", hex: "#FFFFFF" },
                    { name: "Burgundy", hex: "#4A0E17" },
                    { name: "Charcoal", hex: "#2A2E2B" },
                    { name: "Grey Wash", hex: "#7E857F" },
                    { name: "Navy", hex: "#0F1A2C" },
                  ].map((preset) => {
                    const exists = formData.colors.some(
                      (c: any) => c.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={exists}
                        onClick={() => handleAddPresetColor(preset)}
                        title={exists ? `${preset.name} (already added)` : `Add ${preset.name}`}
                        className={`w-8 h-8 rounded-lg border-2 transition ${
                          exists
                            ? "border-[#284234] opacity-30 cursor-not-allowed"
                            : "border-[#284234] hover:border-[#d4af37] hover:scale-110 cursor-pointer"
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors List */}
              <div className="space-y-2">
                {formData.colors.map((color: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleCustomColorChange(index, { ...color, hex: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => handleCustomColorChange(index, { ...color, name: e.target.value })}
                      className="flex-1 bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newColor = { name: `Color ${formData.colors.length + 1}`, hex: "#091D12" };
                    const newColors = [...formData.colors, newColor];
                    const newVariants = syncVariants(formData.variants, formData.sizes, newColors);
                    setFormData({ ...formData, colors: newColors, variants: newVariants });
                  }}
                  className="px-4 py-2 bg-[#091D12] border border-[#284234] text-neutral-300 hover:text-white hover:border-[#d4af37] text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  + Add Custom Color
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#284234]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-[#091D12] border border-[#284234] text-white font-bold text-xs rounded-xl hover:border-[#d4af37] transition cursor-pointer"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-[#11301F] border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Next: Variants & Stock ({formData.variants.length}) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Variants and Stock */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-neutral-300">Variant Stock & Pricing</label>
                <p className="text-[11px] text-neutral-400">Manage individual inventory levels for each size and color.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const synced = syncVariants(formData.variants, formData.sizes, formData.colors);
                  setFormData({ ...formData, variants: synced });
                }}
                className="text-xs text-[#d4af37] hover:underline cursor-pointer"
              >
                ↻ Refresh Variants
              </button>
            </div>
            
            <div className="bg-[#091D12] border border-[#284234] rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#11301F] border-b border-[#284234] sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[#d4af37] font-bold">Size</th>
                    <th className="px-4 py-2.5 text-left text-[#d4af37] font-bold">Color</th>
                    <th className="px-4 py-2.5 text-left text-[#d4af37] font-bold">Stock</th>
                    <th className="px-4 py-2.5 text-left text-[#d4af37] font-bold">Price Override (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.variants.map((variant: any) => (
                    <tr key={variant.id} className="border-t border-[#284234] hover:bg-[#11301F]/50">
                      <td className="px-4 py-2.5 text-white font-semibold">{variant.size}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-[#284234]"
                            style={{ backgroundColor: variant.color.hex }}
                          />
                          <span className="text-white">{variant.color.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariantStock(variant.id, Number(e.target.value))}
                          className="w-20 bg-[#11301F] border border-[#284234] rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#d4af37] outline-none"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={variant.price || ""}
                          onChange={(e) => updateVariantPrice(variant.id, e.target.value)}
                          placeholder="Base price"
                          className="w-28 bg-[#11301F] border border-[#284234] rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#d4af37] outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#091D12] border border-[#284234] rounded-xl p-4 flex items-center justify-between">
              <div className="text-xs text-neutral-300">
                Total Variants: <span className="text-[#d4af37] font-bold">{formData.variants.length}</span>
                <span className="mx-3 text-neutral-600">|</span>
                Total Units in Stock: <span className="text-[#d4af37] font-bold">
                  {formData.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">All variants verified</span>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#284234]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-[#091D12] border border-[#284234] text-white font-bold text-xs rounded-xl hover:border-[#d4af37] transition cursor-pointer"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-[#091D12] border border-[#284234] text-neutral-300 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-[#d4af37]/20"
                >
                  {isSubmitting ? "Saving..." : product ? "Update Product" : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// Category Form Component
function CategoryForm({ category, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
      <h3 className="text-lg font-black text-[#d4af37] uppercase tracking-wide mb-6">
        {category ? "Edit Category" : "Add New Category"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
            rows={3}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            {category ? "Update Category" : "Save Category"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#091D12] border border-[#284234] text-neutral-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
