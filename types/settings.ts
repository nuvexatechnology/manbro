export interface SiteAnnouncementSettings {
  freeShippingText: string;
  offerText: string;
  offerCode: string;
  isEnabled: boolean;
  updatedAt?: string;
}

export const DEFAULT_ANNOUNCEMENT_SETTINGS: SiteAnnouncementSettings = {
  freeShippingText: "FREE SHIPPING ON ORDERS OVER ₹999",
  offerText: "10% OFF YOUR FIRST ORDER",
  offerCode: "",
  isEnabled: true,
};
