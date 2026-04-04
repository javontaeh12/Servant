import { readBlob, writeBlob } from "./blob-storage";
import { GalleryConfig } from "./types";

const GALLERY_JSON_PATH = "gallery/gallery.json";

export async function readGallery(): Promise<GalleryConfig> {
  return readBlob<GalleryConfig>(GALLERY_JSON_PATH, { images: [] });
}

export async function writeGallery(config: GalleryConfig): Promise<void> {
  await writeBlob(GALLERY_JSON_PATH, config);
}
