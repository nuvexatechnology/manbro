import "server-only";
import { getDb } from "./client";
import { SiteAnnouncementSettings, DEFAULT_ANNOUNCEMENT_SETTINGS } from "@/types/settings";

const SETTINGS_ROW_ID = "site_announcements";

let inMemorySettings: SiteAnnouncementSettings = DEFAULT_ANNOUNCEMENT_SETTINGS;

export async function getAnnouncementSettings(): Promise<SiteAnnouncementSettings> {
  try {
    const db = getDb();
    const { data, error } = await db
      .from("manbro_settings")
      .select("data")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();

    if (error || !data?.data) {
      return inMemorySettings;
    }
    return { ...DEFAULT_ANNOUNCEMENT_SETTINGS, ...data.data };
  } catch {
    return inMemorySettings;
  }
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
