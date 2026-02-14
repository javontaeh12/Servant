import { promises as fs } from "fs";
import path from "path";
import { BusinessInfo } from "./types";
import { withFileLock } from "./file-lock";

const BUSINESS_FILE = path.join(process.cwd(), "data", "business.json");

export async function readBusiness(): Promise<BusinessInfo> {
  const raw = await fs.readFile(BUSINESS_FILE, "utf-8");
  return JSON.parse(raw) as BusinessInfo;
}

export async function writeBusiness(config: BusinessInfo): Promise<void> {
  await withFileLock(BUSINESS_FILE, () =>
    fs.writeFile(BUSINESS_FILE, JSON.stringify(config, null, 2), "utf-8")
  );
}
