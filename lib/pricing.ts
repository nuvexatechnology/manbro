export function calculateTotals(value: number) {
  const subtotal = Math.round(value * 100) / 100;
  const shipping = subtotal >= 999 ? 0 : 70;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST on apparel
  return { subtotal, discount: 0, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}
