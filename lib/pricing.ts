export interface PricingTotalsOptions {
  standardShippingFee?: number;
  freeShippingThreshold?: number;
  isFreeShippingEnabled?: boolean;
}

export function calculateTotals(value: number, options?: PricingTotalsOptions) {
  const subtotal = Math.round(value * 100) / 100;
  const threshold = typeof options?.freeShippingThreshold === "number" ? options.freeShippingThreshold : 1;
  const fee = typeof options?.standardShippingFee === "number" ? options.standardShippingFee : 70;
  const isFree = typeof options?.isFreeShippingEnabled === "boolean" ? options.isFreeShippingEnabled : true;

  const shipping = isFree && subtotal >= threshold ? 0 : fee;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST on apparel
  return { subtotal, discount: 0, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}
