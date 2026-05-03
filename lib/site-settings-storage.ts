import { uploadObject, getPublicUrl } from "./r2";
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
    const response = await fetch(getPublicUrl(SETTINGS_PATH), { cache: "no-store" });
    if (!response.ok) return DEFAULT_SETTINGS;
    const data = await response.json();
    return { ...DEFAULT_SETTINGS, ...data } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSiteSettings(settings: SiteSettings): Promise<void> {
  await uploadObject(
    SETTINGS_PATH,
    JSON.stringify(settings, null, 2),
    "application/json"
  );
}
