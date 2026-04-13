import { supabase, PUBLIC_BUCKET } from "./supabase";
import { PricingConfig, PricingEntry } from "./types";
import staticPricing from "@/data/pricing.json";

const PRICING_PATH = "data/pricing.json";

const DEFAULT_PRICING: PricingConfig = staticPricing as unknown as PricingConfig;

// Normalize entries that may be in old number format to PricingEntry
function normalizeEntries(
  entries: Record<string, number | PricingEntry>
): Record<string, PricingEntry> {
  const result: Record<string, PricingEntry> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (typeof value === "number") {
      result[key] = { price: value, pricingType: "flat" };
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function readPricing(): Promise<PricingConfig> {
  try {
    const { data, error } = await supabase.storage
      .from(PUBLIC_BUCKET)
      .download(PRICING_PATH);
    if (error || !data) return DEFAULT_PRICING;
    const text = await data.text();
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      eventTypes: normalizeEntries(parsed.eventTypes ?? {}),
      serviceStyles: normalizeEntries(parsed.serviceStyles ?? {}),
    } as PricingConfig;
  } catch (error) {
    console.error("readPricing error:", error);
    return DEFAULT_PRICING;
  }
}

export async function writePricing(config: PricingConfig): Promise<void> {
  await supabase.storage.from(PUBLIC_BUCKET).upload(
    PRICING_PATH,
    JSON.stringify(config, null, 2),
    { contentType: "application/json", upsert: true }
  );
}
