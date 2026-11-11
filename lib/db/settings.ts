import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "./client";
import {
  SiteAnnouncementSettings,
  DEFAULT_ANNOUNCEMENT_SETTINGS,
  ShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
} from "@/types/settings";

const SETTINGS_ROW_ID = "site_announcements";
const SHIPPING_SETTINGS_ROW_ID = "shipping_settings";
const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "store-settings.json");

function readDiskSettings(): Record<string, any> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function writeDiskSettings(key: string, data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = readDiskSettings();
    current[key] = data;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(current, null, 2), "utf8");
  } catch (err) {
    console.warn("Failed to write store-settings.json to disk:", err);
  }
}

let inMemorySettings: SiteAnnouncementSettings = (() => {
  const disk = readDiskSettings();
  return disk[SETTINGS_ROW_ID] || DEFAULT_ANNOUNCEMENT_SETTINGS;
})();

let inMemoryShippingSettings: ShippingSettings = (() => {
  const disk = readDiskSettings();
  return disk[SHIPPING_SETTINGS_ROW_ID] || DEFAULT_SHIPPING_SETTINGS;
})();

export async function getAnnouncementSettings(): Promise<SiteAnnouncementSettings> {
  try {
    const db = getDb();
    const { data, error } = await db
      .from("manbro_settings")
      .select("data")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();

    if (!error && data?.data) {
      return { ...DEFAULT_ANNOUNCEMENT_SETTINGS, ...data.data };
    }
  } catch {
    // DB not reachable or table missing, fallback to disk/memory
  }

  const disk = readDiskSettings();
  if (disk[SETTINGS_ROW_ID]) {
    return { ...DEFAULT_ANNOUNCEMENT_SETTINGS, ...disk[SETTINGS_ROW_ID] };
  }
  return inMemorySettings;
}

export async function saveAnnouncementSettings(
  settings: Partial<SiteAnnouncementSettings>
): Promise<SiteAnnouncementSettings> {
  const current = await getAnnouncementSettings();
  const updated: SiteAnnouncementSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  inMemorySettings = updated;
  writeDiskSettings(SETTINGS_ROW_ID, updated);

  try {
    const db = getDb();
    const { error } = await db.from("manbro_settings").upsert({
      id: SETTINGS_ROW_ID,
      data: updated,
      updated_at: updated.updatedAt,
    });

    if (error) {
      console.warn("manbro_settings table note:", error.message || error);
    }
  } catch (e) {
    console.warn("Settings DB upsert catch:", e);
  }

  return updated;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const db = getDb();
    const { data, error } = await db
      .from("manbro_settings")
      .select("data")
      .eq("id", SHIPPING_SETTINGS_ROW_ID)
      .maybeSingle();

    if (!error && data?.data) {
      return { ...DEFAULT_SHIPPING_SETTINGS, ...data.data };
    }
  } catch {
    // DB not reachable or table missing, fallback to disk/memory
  }

  const disk = readDiskSettings();
  if (disk[SHIPPING_SETTINGS_ROW_ID]) {
    return { ...DEFAULT_SHIPPING_SETTINGS, ...disk[SHIPPING_SETTINGS_ROW_ID] };
  }
  return inMemoryShippingSettings;
}

export async function saveShippingSettings(
  settings: Partial<ShippingSettings>
): Promise<ShippingSettings> {
  const current = await getShippingSettings();
  const updated: ShippingSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  inMemoryShippingSettings = updated;
  writeDiskSettings(SHIPPING_SETTINGS_ROW_ID, updated);

  try {
    const db = getDb();
    const { error } = await db.from("manbro_settings").upsert({
      id: SHIPPING_SETTINGS_ROW_ID,
      data: updated,
      updated_at: updated.updatedAt,
    });

    if (error) {
      console.warn("manbro_settings shipping table note:", error.message || error);
    }
  } catch (e) {
    console.warn("Shipping settings DB upsert catch:", e);
  }

  return updated;
}
