import "server-only";
import type { Product, Category } from "@/types/store";
import { getDb } from "./client";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getDb().from("manbro_products").select("data,version").order("id");
  if (error) throw new Error("Catalog unavailable.");
  return data.map(row => ({ ...row.data, version: row.version })) as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getProducts()).filter(product => product.isFeatured);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getDb().from("manbro_categories").select("*").order("name");
  if (error) throw new Error("Categories unavailable.");
  return data.map(row => ({ id: row.id, name: row.name, slug: row.slug, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at }));
}
