import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import ts from "typescript";
import { calculateTotals } from "../lib/pricing.ts";
import { cartInput, checkoutInput, productInput } from "../lib/validators/store.ts";

const require = createRequire(import.meta.url);
const address = { firstName: "Test", lastName: "Buyer", phone: "919999999999", email: "test@example.com", address: "Test street", city: "Test city", state: "Test state", pincode: "123456", paymentMethod: "whatsapp" };
const product = { id: "test-product", name: "Test shirt", slug: "test-shirt", category: "T-Shirts", price: 45, sizes: ["M"], colors: [{ name: "Black", hex: "#000000" }], variants: [{ id: "variant-m", size: "M", color: { name: "Black", hex: "#000000" }, stock: 3, price: 60 }], images: ["/test.jpg"], tags: [], details: [], rating: 0, reviewCount: 0, inStock: true };
const line = { productId: product.id, size: "M", color: "Black", quantity: 1 };

test("shipping boundary and runtime validation reject malformed checkout data", () => {
  assert.deepEqual(calculateTotals(150), { subtotal: 150, discount: 0, shipping: 0, tax: 12, total: 162 });
  assert.equal(calculateTotals(149).shipping, 15);
  assert.equal(checkoutInput.safeParse(address).success, true);
  for (const phone of ["", "abc", "1234"]) assert.equal(checkoutInput.safeParse({ ...address, phone }).success, false);
  for (const quantity of [-1, 0, 0.5, Infinity, 101, "1"]) assert.equal(cartInput.safeParse([{ product: { id: product.id }, selectedSize: "M", selectedColor: { name: "Black" }, quantity }]).success, false);
  assert.equal(productInput.safeParse(product).success, true);
  assert.equal(productInput.safeParse({ ...product, price: "abc" }).success, false);
  assert.equal(productInput.safeParse({ ...product, variants: [...product.variants, ...product.variants] }).success, false);
});

test("migration transactions enforce stock, trusted prices, retries, cancellation and role isolation", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(readFileSync(new URL("../supabase/migrations/20260906110654_secure_store.sql", import.meta.url), "utf8"));
  await db.query("insert into manbro_categories(id,name,slug) values('test-category','T-Shirts','t-shirts')");
  await db.query("insert into manbro_products(id,slug,category,data) values($1,$2,$3,$4)", [product.id, product.slug, product.category, product]);
  const create = async (items, requestId = randomUUID(), shipping = address) => (await db.query("select manbro_create_order($1,$2,$3) as result", [shipping, items, requestId])).rows[0].result;
  const stock = async () => (await db.query("select (data->'variants'->0->>'stock')::integer as stock from manbro_products where id=$1", [product.id])).rows[0].stock;
  const requestId = randomUUID();
  const order = await create([{ ...line, price: 0, product: { price: 0 } }], requestId);
  assert.equal(order.subtotal, 60);
  assert.equal(order.items[0].product.price, 60);
  assert.equal(order.total, 80);
  assert.equal(await stock(), 2);
  assert.equal((await create([{ ...line, price: 0, product: { price: 0 } }], requestId)).id, order.id);
  assert.equal(await stock(), 2);
  await assert.rejects(create([line], requestId), /Request changed/);
  await assert.rejects(create([{ ...line, quantity: 3 }]), /Insufficient stock/);
  assert.equal(await stock(), 2);
  await assert.rejects(create([line, { ...line, productId: "missing" }]), /Product unavailable/);
  assert.equal(await stock(), 2, "transaction rollback restores earlier line reservation");
  for (const quantity of [0, -1, 0.5, 101]) await assert.rejects(create([{ ...line, quantity }]), /Invalid quantity/);
  await assert.rejects(create([line, line]), /Duplicate variant/);
  await assert.rejects(create([{ ...line, size: "XS" }]), /Insufficient stock/);
  const competing = await Promise.allSettled([create([{ ...line, quantity: 2 }]), create([{ ...line, quantity: 2 }])]);
  assert.equal(competing.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(await stock(), 0);
  const cancel = () => db.query("select manbro_update_order($1,$2)", [order.id, { status: "CANCELLED" }]);
  await cancel();
  assert.equal(await stock(), 1);
  await cancel();
  assert.equal(await stock(), 1, "repeated cancellation does not double-restock");
  await assert.rejects(db.query("select manbro_update_order($1,$2)", [order.id, { status: "NEW" }]), /cannot be reopened/);
  const staleWrite = await db.query("update manbro_products set data=data where id=$1 and version=1 returning id", [product.id]);
  assert.equal(staleWrite.rows.length, 0, "stale admin forms cannot overwrite changed stock");
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    await assert.rejects(db.query("select * from manbro_orders"), /permission denied/);
    await assert.rejects(create([line]), /permission denied/);
    await assert.rejects(db.query("select manbro_update_order($1,$2)", [order.id, { adminNotes: "hacked" }]), /permission denied/);
    await db.exec("reset role");
  }
  await db.exec("set role service_role");
  assert.equal((await db.query("select count(*)::integer as count from manbro_orders")).rows[0].count, 2);
  await db.exec("reset role");
  const dump = await db.dumpDataDir();
  const reopened = new PGlite({ loadDataDir: dump });
  try {
    assert.equal((await reopened.query("select data->>'status' as status from manbro_orders where id=$1", [order.id])).rows[0].status, "CANCELLED");
  } finally { await reopened.close(); }
});

function load(relative, mocks) {
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const exports = {};
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports, process: { env: { STORE_WHATSAPP_NUMBER: "919999999999" } },
    require: name => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

test("all admin action and API entrypoints reject unauthenticated calls before data access", async () => {
  const mocks = {
    "server-only": {},
    "@/lib/auth/admin": { isAdmin: async () => false, isSameOrigin: () => true },
    "@/lib/db/client": { getDb: () => { throw new Error("Database must not be touched"); } },
    "@/lib/db/catalog": {}, "@/lib/db/supabase": {}, "@/lib/validators/store": {},
  };
  const actions = load("../actions/order.ts", mocks);
  for (const name of ["getAdminOrdersAction", "updateOrderStatusAction", "addIndiaPostTrackingAction", "updateAdminNotesAction"]) {
    assert.equal((await actions[name]()).error, "Unauthorized");
  }
  for (const path of ["products", "categories"]) {
    const route = load(`../app/api/admin/${path}/route.ts`, mocks);
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      assert.equal((await route[method](new Request(`http://localhost/api/admin/${path}`, { headers: { authorization: "Bearer x" } }))).status, 401);
    }
  }
});

test("tracking requires exact normalized phone and excludes private customer fields", async () => {
  const order = { id: "ORD-" + randomUUID().toUpperCase(), createdAt: new Date().toISOString(), items: [], subtotal: 60, discount: 0, shipping: 15, tax: 5, total: 80, status: "NEW", shippingAddress: address, adminNotes: "PRIVATE" };
  let queries = 0;
  const mocks = {
    "server-only": {}, "@/lib/auth/admin": { requireAdmin: async () => {} },
    "./client": { getDb: () => ({ from: () => {
      queries++;
      const filters = {};
      const query = { select: () => query, eq: (key, value) => { filters[key] = value; return query; }, maybeSingle: async () => ({ data: filters.phone === address.phone ? { data: order } : null, error: null }) };
      return query;
    } }) },
  };
  const repository = load("../lib/db/supabase.ts", mocks);
  for (const phone of ["", "abc", "1234"]) assert.equal(await repository.getOrderByIdAndPhone(order.id, phone), null);
  assert.equal(queries, 0);
  assert.equal(await repository.getOrderByIdAndPhone(order.id, "99999999"), null);
  const result = await repository.getOrderByIdAndPhone(order.id, "+91 99999 99999");
  assert.equal(result.id, order.id);
  assert.equal("adminNotes" in result, false);
  assert.equal("shippingAddress" in result, false);
});
