import assert from "node:assert/strict";
import test from "node:test";
import { filterProducts, getFeaturedProducts, getProductBySlug, getProducts } from "../../lib/catalog.ts";

const products = [
  {
    id: "tee", slug: "cotton-tee", name: "Cotton Tee", description: "Everyday staple",
    tags: ["organic"], category: "T-Shirts", price: 50, rating: 4,
    isFeatured: true, isNewArrival: false,
    variants: [
      { size: "S", color: { name: "Black" }, stock: 2, price: 0 },
      { size: "M", color: { name: "White" }, stock: 1 },
      { size: "L", color: { name: "Red" }, stock: 0 },
    ],
  },
  {
    id: "hoodie", slug: "warm-hoodie", name: "Warm Hoodie", description: "Heavy fleece",
    tags: ["winter"], category: "Hoodies", price: 150, rating: 5,
    isFeatured: false, isNewArrival: true,
    variants: [{ size: "L", color: { name: "Black" }, stock: 3 }],
  },
];
const defaults = {
  category: "All", searchQuery: "", selectedSizes: [], selectedColors: [],
  minPrice: 0, maxPrice: 500, sortBy: "featured",
};
const ids = (filters = {}) => filterProducts(products, { ...defaults, ...filters }).map((product) => product.id);

test("catalog preserves category and name, description, and tag search", () => {
  assert.deepEqual(ids({ category: "Hoodies" }), ["hoodie"]);
  for (const searchQuery of ["COTTON", "staple", "ORGANIC"]) {
    assert.deepEqual(ids({ searchQuery }), ["tee"]);
  }
  assert.deepEqual(ids({ searchQuery: "   " }), ["tee", "hoodie"]);
  assert.deepEqual(ids({ searchQuery: " cotton " }), []);
});

test("size and color filters independently match in-stock variants", () => {
  assert.deepEqual(ids({ selectedSizes: ["L"] }), ["hoodie"]);
  assert.deepEqual(ids({ selectedColors: ["red"] }), []);
  assert.deepEqual(ids({ selectedSizes: ["S"], selectedColors: ["WHITE"] }), ["tee"]);
});

test("price bounds are inclusive and use base rather than variant price", () => {
  assert.deepEqual(ids({ minPrice: 50, maxPrice: 50 }), ["tee"]);
  assert.deepEqual(ids({ minPrice: 0, maxPrice: 0 }), []);
});

test("all sort modes preserve the source catalog order", () => {
  for (const sortBy of ["price-desc", "newest", "rating"]) {
    assert.deepEqual(ids({ sortBy }), ["hoodie", "tee"]);
  }
  for (const sortBy of ["price-asc", "featured"]) {
    assert.deepEqual(ids({ sortBy }), ["tee", "hoodie"]);
  }
  assert.deepEqual(products.map((product) => product.id), ["tee", "hoodie"]);
});

test("catalog fetch bypasses cache and helpers use the API catalog", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/products");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ success: true, products });
  });
  assert.deepEqual(await getProducts(), products);
  assert.deepEqual(await getFeaturedProducts(), [products[0]]);
  assert.deepEqual(await getProductBySlug("warm-hoodie"), products[1]);
  assert.equal(await getProductBySlug("missing"), undefined);
  assert.equal(fetchMock.mock.callCount(), 4);
});

test("HTTP, unsuccessful, malformed, and network responses reject for retry UI", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");
  for (const response of [
    new Response("Unavailable", { status: 503 }),
    Response.json({ success: false, products: [] }),
    Response.json({ success: true, products: null }),
    new Response("not json"),
  ]) {
    fetchMock.mock.mockImplementation(async () => response);
    await assert.rejects(getProducts());
  }
  fetchMock.mock.mockImplementation(async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(getProducts());
});

test("caller cancellation is forwarded to the catalog fetch", async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.signal.aborted, true);
    options.signal.throwIfAborted();
  });
  await assert.rejects(getProducts(controller.signal), { name: "AbortError" });
});
