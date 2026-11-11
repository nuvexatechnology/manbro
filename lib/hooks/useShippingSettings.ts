"use client";

import { useState, useEffect, useCallback } from "react";
import { ShippingSettings, DEFAULT_SHIPPING_SETTINGS } from "@/types/settings";

export function useShippingSettings() {
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/shipping", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.settings) {
        setShippingSettings(data.settings);
      }
    } catch {
      // Use fallback defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener("manbro-shipping-updated", handleUpdate);
    return () => {
      window.removeEventListener("manbro-shipping-updated", handleUpdate);
    };
  }, [fetchSettings]);

  return { shippingSettings, isLoadingShipping: isLoading, refreshShipping: fetchSettings };
}
