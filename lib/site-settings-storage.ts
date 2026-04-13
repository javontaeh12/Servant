import { supabase, PUBLIC_BUCKET } from "./supabase";
import staticSettings from "@/data/site-settings.json";

const SETTINGS_PATH = "data/site-settings.json";

export interface SiteSettings {
  quoteFormMode: "builder" | "simple";
  featuredImage: string;
  featuredImageActive: boolean;
  showBusinessHours: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = staticSettings as SiteSettings;

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.storage
      .from(PUBLIC_BUCKET)
      .download(SETTINGS_PATH);
    if (error || !data) return DEFAULT_SETTINGS;
    const text = await data.text();
    const parsed = JSON.parse(text);
    return { ...DEFAULT_SETTINGS, ...parsed } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSiteSettings(settings: SiteSettings): Promise<void> {
  await supabase.storage.from(PUBLIC_BUCKET).upload(
    SETTINGS_PATH,
    JSON.stringify(settings, null, 2),
    { contentType: "application/json", upsert: true }
  );
}
