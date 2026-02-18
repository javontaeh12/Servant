import { put, list } from "@vercel/blob";

const SPECIALTY_IMAGES_PATH = "data/specialty-images.json";

// Maps service name → image URL
export type SpecialtyImages = Record<string, string>;

export async function readSpecialtyImages(): Promise<SpecialtyImages> {
  try {
    const { blobs } = await list({ prefix: SPECIALTY_IMAGES_PATH });
    if (blobs.length === 0) {
      return {};
    }
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return {};
    }
    return (await response.json()) as SpecialtyImages;
  } catch {
    return {};
  }
}

export async function writeSpecialtyImages(images: SpecialtyImages): Promise<void> {
  await put(SPECIALTY_IMAGES_PATH, JSON.stringify(images, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
