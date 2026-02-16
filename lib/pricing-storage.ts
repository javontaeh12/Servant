import { promises as fs } from "fs";
import path from "path";
import { PricingConfig, PricingEntry } from "./types";
import { withFileLock } from "./file-lock";

const PRICING_FILE = path.join(process.cwd(), "data", "pricing.json");

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
  const raw = await fs.readFile(PRICING_FILE, "utf-8");
  const data = JSON.parse(raw);
  return {
    ...data,
    eventTypes: normalizeEntries(data.eventTypes ?? {}),
    serviceStyles: normalizeEntries(data.serviceStyles ?? {}),
  } as PricingConfig;
}

export async function writePricing(config: PricingConfig): Promise<void> {
  await withFileLock(PRICING_FILE, () =>
    fs.writeFile(PRICING_FILE, JSON.stringify(config, null, 2), "utf-8")
  );
}
