import { z } from "zod";

const text = z.string().trim().min(1).max(200);
const money = z.number().finite().min(0).max(1000000).refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.000001);
export const size = z.preprocess((v) => typeof v === "string" ? v.trim().toUpperCase() : v, z.enum(["XS", "S", "M", "L", "XL", "XXL"]));

export const hexColor = z.preprocess((v) => {
  if (typeof v === "string") {
    let s = v.trim();
    if (!s.startsWith("#")) s = `#${s}`;
    if (/^#[0-9a-f]{3}$/i.test(s)) {
      return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
    }
    return s;
  }
  return v;
}, z.string().regex(/^#[0-9a-f]{6}$/i, "Hex code must be #RRGGBB"));

export const color = z.object({
  name: text,
  hex: hexColor,
});

export const image = z.string().trim().transform((val) => {
  if (!val) return "/images/products/tshirt-burgundy.jpg";
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) {
    return val;
  }
  return `/${val}`;
}).refine((val) => {
  if (val.startsWith("/")) return true;
  try {
    const url = new URL(val);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, { message: "Image path must start with / or be a valid http(s) URL" });

export const productInput = z.object({
  name: text,
  slug: z.preprocess((v) => {
    if (typeof v === "string") {
      const slugified = v
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");
      return slugified || "product";
    }
    return v;
  }, z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
  description: z.string().max(10000).default(""),
  price: z.preprocess((v) => {
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed) return NaN;
      const n = Number(trimmed);
      return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      return Math.round(v * 100) / 100;
    }
    return v;
  }, money),
  originalPrice: z.preprocess((v) => {
    if (v === "" || v == null || v === 0) return undefined;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed || trimmed === "0") return undefined;
      const n = Number(trimmed);
      return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      return v > 0 ? Math.round(v * 100) / 100 : undefined;
    }
    return undefined;
  }, money.optional()),
  category: text,
  sizes: z.array(size).min(1, "At least one size is required").max(6),
  colors: z.array(color).min(1, "At least one color is required").max(50),
  images: z.preprocess((v) => {
    if (typeof v === "string") {
      const split = v.split(",").map((s) => s.trim()).filter(Boolean);
      return split.length > 0 ? split : ["/images/products/tshirt-burgundy.jpg"];
    }
    if (Array.isArray(v)) {
      const arr = v.map((s) => typeof s === "string" ? s.trim() : s).filter(Boolean);
      return arr.length > 0 ? arr : ["/images/products/tshirt-burgundy.jpg"];
    }
    return v;
  }, z.array(image).min(1).max(20)),
  colorImages: z.preprocess((v) => {
    if (v && typeof v === "object") {
      const cleaned: Record<string, string> = {};
      for (const [k, val] of Object.entries(v)) {
        if (typeof val === "string" && val.trim()) {
          const trimmed = val.trim();
          cleaned[k.trim()] = trimmed.startsWith("/") || trimmed.startsWith("http") ? trimmed : `/${trimmed}`;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
    return undefined;
  }, z.record(z.string(), image).optional()),
  variants: z.preprocess((v) => {
    if (!Array.isArray(v) || v.length === 0) return v;
    return v.map((item, idx) => {
      if (item && typeof item === "object") {
        return {
          ...item,
          id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `var-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          stock: item.stock === "" || item.stock == null ? 0 : item.stock,
        };
      }
      return item;
    });
  }, z.array(z.object({
    id: text,
    size,
    color: z.object({
      name: text,
      hex: hexColor,
    }),
    stock: z.preprocess((v) => {
      if (typeof v === "string") {
        const trimmed = v.trim();
        return trimmed === "" ? 0 : Math.max(0, parseInt(trimmed, 10) || 0);
      }
      if (typeof v === "number") return Math.max(0, Math.floor(v));
      return v;
    }, z.number().int().min(0).max(1000000)),
    price: z.preprocess((v) => {
      if (v === "" || v == null || v === 0) return undefined;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (!trimmed || trimmed === "0") return undefined;
        const n = Number(trimmed);
        return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
      }
      if (typeof v === "number" && Number.isFinite(v)) return v > 0 ? Math.round(v * 100) / 100 : undefined;
      return undefined;
    }, money.optional()),
  })).min(1, "At least one product variant is required").max(300)),
}).superRefine((p, ctx) => {
  const seenCombos = new Set<string>();
  const duplicateIndices: number[] = [];
  p.variants.forEach((v, idx) => {
    const key = `${v.size}:${v.color.name.toLowerCase().trim()}`;
    if (seenCombos.has(key)) {
      duplicateIndices.push(idx);
    } else {
      seenCombos.add(key);
    }
  });
  if (duplicateIndices.length > 0) {
    ctx.addIssue({ code: "custom", message: "Variant combinations must have unique size and color." });
  }
  const selectedSizes = new Set(p.sizes);
  const invalidSizes = p.variants.filter(v => !selectedSizes.has(v.size));
  if (invalidSizes.length > 0) {
    ctx.addIssue({ code: "custom", message: `Variants contain sizes not in selected sizes: ${[...new Set(invalidSizes.map(v => v.size))].join(", ")}` });
  }
  const selectedColorNames = new Set(p.colors.map(c => c.name.toLowerCase().trim()));
  const invalidColors = p.variants.filter(v => !selectedColorNames.has(v.color.name.toLowerCase().trim()));
  if (invalidColors.length > 0) {
    ctx.addIssue({ code: "custom", message: `Variants contain colors not in selected colors: ${[...new Set(invalidColors.map(v => v.color.name))].join(", ")}` });
  }
});

export const categoryInput = z.object({ name: text, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200), description: z.string().max(2000).default("") });
export const checkoutInput = z.object({
  firstName: text, lastName: text, email: z.string().trim().email().max(254),
  phone: z.string().max(40).transform(v => v.replace(/\D/g, "")).pipe(z.string().regex(/^\d{8,15}$/)),
  address: z.string().trim().min(1).max(1000), city: text, state: text,
  pincode: z.string().trim().regex(/^[\w -]{5,12}$/), notes: z.string().max(2000).optional(),
  paymentMethod: z.literal("whatsapp"),
});
export const cartInput = z.array(z.object({
  product: z.object({ id: text }), selectedSize: size, selectedColor: z.object({ name: text }),
  quantity: z.number().int().min(1).max(100),
})).min(1).max(100);
export const orderStatusInput = z.enum(["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);
export const trackingInput = z.object({ courierName: text, trackingNumber: text, shippingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), shippingCharge: money });
