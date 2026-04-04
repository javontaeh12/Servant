import { readBlob, writeBlob } from "./blob-storage";
import { BusinessInfo } from "./types";
import staticBusiness from "@/data/business.json";

const BUSINESS_JSON_PATH = "data/business.json";

const DEFAULT_BUSINESS: BusinessInfo = staticBusiness as BusinessInfo;

export async function readBusiness(): Promise<BusinessInfo> {
  return readBlob<BusinessInfo>(BUSINESS_JSON_PATH, DEFAULT_BUSINESS);
}

export async function writeBusiness(config: BusinessInfo): Promise<void> {
  await writeBlob(BUSINESS_JSON_PATH, config);
}
