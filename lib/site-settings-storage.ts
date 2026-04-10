import { put, list } from "@vercel/blob";
import staticSettings from "@/data/site-settings.json";

const SETTINGS_PREFIX = "data/site-settings";

export interface SiteSettings {
  quoteFormMode: "builder" | "simple";
  featuredImage: string;
  featuredImageActive: boolean;
  showBusinessHours: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = staticSettings as SiteSettings;

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const { blobs } = await list({ prefix: SETTINGS_PREFIX });
    if (blobs.length === 0) return DEFAULT_SETTINGS;
    blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) return DEFAULT_SETTINGS;
    const data = await response.json();
    return { ...DEFAULT_SETTINGS, ...data } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSiteSettings(settings: SiteSettings): Promise<void> {
  await put(
    `${SETTINGS_PREFIX}.json`,
    JSON.stringify(settings, null, 2),
    { access: "public", contentType: "application/json", allowOverwrite: true }
  );
}
