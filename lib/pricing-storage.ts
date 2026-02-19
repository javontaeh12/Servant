import { put, list } from "@vercel/blob";
import { PricingConfig, PricingEntry } from "./types";
import staticPricing from "@/data/pricing.json";

const PRICING_JSON_PATH = "data/pricing.json";

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
    const { blobs } = await list({ prefix: PRICING_JSON_PATH });
    if (blobs.length === 0) {
      return DEFAULT_PRICING;
    }
    const response = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return DEFAULT_PRICING;
    }
    const data = await response.json();
    return {
      ...data,
      eventTypes: normalizeEntries(data.eventTypes ?? {}),
      serviceStyles: normalizeEntries(data.serviceStyles ?? {}),
    } as PricingConfig;
  } catch {
    return DEFAULT_PRICING;
  }
}

export async function writePricing(config: PricingConfig): Promise<void> {
  await put(PRICING_JSON_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
