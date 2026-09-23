import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configure server-only Supabase credentials first.");
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const source = readFileSync(new URL("../lib/db/products-data.ts", import.meta.url), "utf8");
const exports = {};
runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
const categories = [...new Set(exports.PRODUCTS.map(product => product.category))].map(name => ({ id: `cat-${name.toLowerCase().replaceAll(" ", "-")}`, name, slug: name.toLowerCase().replaceAll(" ", "-"), description: "" }));
const categoryResult = await db.from("manbro_categories").upsert(categories, { onConflict: "name", ignoreDuplicates: true });
if (categoryResult.error) throw new Error("Category seed failed. Apply the migration first.");
const result = await db.from("manbro_products").upsert(exports.PRODUCTS.map(product => ({ id: product.id, slug: product.slug, category: product.category, data: product })), { onConflict: "id", ignoreDuplicates: true });
if (result.error) throw new Error("Product seed failed. Check existing category and slug conflicts.");
console.log("Missing starter products inserted. Existing products and inventory were not overwritten.");
