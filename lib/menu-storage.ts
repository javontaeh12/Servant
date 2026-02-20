import { put, list } from "@vercel/blob";
import { MenuConfig } from "./types";
import staticMenu from "@/data/menu.json";

const MENU_JSON_PATH = "data/menu.json";

const DEFAULT_MENU: MenuConfig = staticMenu as MenuConfig;

export async function readMenu(): Promise<MenuConfig> {
  try {
    const { blobs } = await list({ prefix: MENU_JSON_PATH });
    if (blobs.length === 0) {
      return DEFAULT_MENU;
    }
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) {
      return DEFAULT_MENU;
    }
    return (await response.json()) as MenuConfig;
  } catch {
    return DEFAULT_MENU;
  }
}

export async function writeMenu(config: MenuConfig): Promise<void> {
  await put(MENU_JSON_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
