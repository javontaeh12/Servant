import { put, list } from "@vercel/blob";
import { MenuConfig } from "./types";

const MENU_JSON_PATH = "data/menu.json";

const DEFAULT_MENU: MenuConfig = {
  categories: [
    { id: "appetizers", name: "Appetizers", sortOrder: 1 },
    { id: "entrees", name: "Entrées", sortOrder: 2 },
    { id: "sides", name: "Sides", sortOrder: 3 },
    { id: "desserts", name: "Desserts", sortOrder: 4 },
    { id: "beverages", name: "Beverages", sortOrder: 5 },
  ],
  items: [],
  presetMeals: [],
};

export async function readMenu(): Promise<MenuConfig> {
  try {
    const { blobs } = await list({ prefix: MENU_JSON_PATH });
    if (blobs.length === 0) {
      return DEFAULT_MENU;
    }
    const response = await fetch(blobs[0].url);
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
