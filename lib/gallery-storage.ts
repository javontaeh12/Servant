import { put, list } from "@vercel/blob";
import { GalleryConfig } from "./types";

const GALLERY_JSON_PATH = "gallery/gallery.json";

export async function readGallery(): Promise<GalleryConfig> {
  try {
    const { blobs } = await list({ prefix: GALLERY_JSON_PATH });
    if (blobs.length === 0) {
      return { images: [] };
    }
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return { images: [] };
    }
    return (await response.json()) as GalleryConfig;
  } catch {
    return { images: [] };
  }
}

export async function writeGallery(config: GalleryConfig): Promise<void> {
  await put(GALLERY_JSON_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
