import { promises as fs } from "fs";
import path from "path";
import { PricingConfig } from "./types";

const PRICING_FILE = path.join(process.cwd(), "data", "pricing.json");

export async function readPricing(): Promise<PricingConfig> {
  const raw = await fs.readFile(PRICING_FILE, "utf-8");
  return JSON.parse(raw) as PricingConfig;
}

export async function writePricing(config: PricingConfig): Promise<void> {
  await fs.writeFile(PRICING_FILE, JSON.stringify(config, null, 2), "utf-8");
}
