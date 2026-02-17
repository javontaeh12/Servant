import { put, list } from "@vercel/blob";
import { BusinessInfo } from "./types";
import staticBusiness from "@/data/business.json";

const BUSINESS_JSON_PATH = "data/business.json";

const DEFAULT_BUSINESS: BusinessInfo = staticBusiness as BusinessInfo;

export async function readBusiness(): Promise<BusinessInfo> {
  try {
    const { blobs } = await list({ prefix: BUSINESS_JSON_PATH });
    if (blobs.length === 0) {
      return DEFAULT_BUSINESS;
    }
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return DEFAULT_BUSINESS;
    }
    return (await response.json()) as BusinessInfo;
  } catch {
    return DEFAULT_BUSINESS;
  }
}

export async function writeBusiness(config: BusinessInfo): Promise<void> {
  await put(BUSINESS_JSON_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
