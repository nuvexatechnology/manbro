export interface SiteAnnouncementSettings {
  freeShippingText: string;
  offerText: string;
  offerCode: string;
  isEnabled: boolean;
  updatedAt?: string;
}

export const DEFAULT_ANNOUNCEMENT_SETTINGS: SiteAnnouncementSettings = {
  freeShippingText: "FREE SHIPPING ON ALL ORDERS ABOVE ₹1",
  offerText: "10% OFF YOUR FIRST ORDER",
  offerCode: "",
  isEnabled: true,
};

export interface ShippingSettings {
  standardShippingFee: number;
  freeShippingThreshold: number;
  isFreeShippingEnabled: boolean;
  estimatedDeliveryDays: string;
  updatedAt?: string;
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardShippingFee: 70,
  freeShippingThreshold: 1, // Free shipping for orders above ₹1
  isFreeShippingEnabled: true,
  estimatedDeliveryDays: "3-5 business days",
};
