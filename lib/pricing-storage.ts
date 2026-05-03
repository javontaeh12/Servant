import { uploadObject, getPublicUrl } from "./r2";
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
    const response = await fetch(getPublicUrl(PRICING_PATH), { cache: "no-store" });
    if (!response.ok) return DEFAULT_PRICING;
    const parsed = await response.json();
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
  await uploadObject(
    PRICING_PATH,
    JSON.stringify(config, null, 2),
    "application/json"
  );
}
