import { put, list, del } from "@vercel/blob";
import { PricingConfig, PricingEntry } from "./types";
import staticPricing from "@/data/pricing.json";

const PRICING_PREFIX = "data/pricing";

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
    const { blobs } = await list({ prefix: PRICING_PREFIX });
    if (blobs.length === 0) {
      return DEFAULT_PRICING;
    }
    // Always use the most recently uploaded blob
    blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) {
      console.error("Blob fetch failed:", blobs[0].url, response.status);
      return DEFAULT_PRICING;
    }
    const data = await response.json();
    return {
      ...data,
      eventTypes: normalizeEntries(data.eventTypes ?? {}),
      serviceStyles: normalizeEntries(data.serviceStyles ?? {}),
    } as PricingConfig;
  } catch (error) {
    console.error("readPricing error:", error);
    return DEFAULT_PRICING;
  }
}

export async function writePricing(config: PricingConfig): Promise<void> {
  // Each write creates a unique URL (random suffix) so CDN never serves stale data
  const result = await put(
    `${PRICING_PREFIX}.json`,
    JSON.stringify(config, null, 2),
    {
      access: "public",
      contentType: "application/json",
    }
  );

  // Clean up old blobs, keeping only the one we just wrote
  try {
    const { blobs } = await list({ prefix: PRICING_PREFIX });
    const toDelete = blobs
      .filter((b) => b.url !== result.url)
      .map((b) => b.url);
    if (toDelete.length > 0) {
      await del(toDelete);
    }
  } catch {
    // Cleanup failure is non-critical
  }
}
