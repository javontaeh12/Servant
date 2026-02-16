import { promises as fs } from "fs";
import path from "path";
import { GalleryConfig } from "./types";
import { withFileLock } from "./file-lock";

const GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");

export async function readGallery(): Promise<GalleryConfig> {
  const raw = await fs.readFile(GALLERY_FILE, "utf-8");
  return JSON.parse(raw) as GalleryConfig;
}

export async function writeGallery(config: GalleryConfig): Promise<void> {
  await withFileLock(GALLERY_FILE, () =>
    fs.writeFile(GALLERY_FILE, JSON.stringify(config, null, 2), "utf-8")
  );
}
