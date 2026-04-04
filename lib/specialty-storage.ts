import { readBlob, writeBlob } from "./blob-storage";

const SPECIALTY_IMAGES_PATH = "data/specialty-images.json";

// Maps service name -> image URL
export type SpecialtyImages = Record<string, string>;

export async function readSpecialtyImages(): Promise<SpecialtyImages> {
  return readBlob<SpecialtyImages>(SPECIALTY_IMAGES_PATH, {});
}

export async function writeSpecialtyImages(images: SpecialtyImages): Promise<void> {
  await writeBlob(SPECIALTY_IMAGES_PATH, images);
}
