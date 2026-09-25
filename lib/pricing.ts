export function calculateTotals(value: number) {
  const subtotal = Math.round(value * 100) / 100;
  const shipping = subtotal >= 150 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08);
  return { subtotal, discount: 0, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}
