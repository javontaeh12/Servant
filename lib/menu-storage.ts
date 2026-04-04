import { readBlob, writeBlob } from "./blob-storage";
import { MenuConfig } from "./types";
import staticMenu from "@/data/menu.json";

const MENU_JSON_PATH = "data/menu.json";

const DEFAULT_MENU: MenuConfig = staticMenu as MenuConfig;

export async function readMenu(): Promise<MenuConfig> {
  return readBlob<MenuConfig>(MENU_JSON_PATH, DEFAULT_MENU, { noCache: true });
}

export async function writeMenu(config: MenuConfig): Promise<void> {
  await writeBlob(MENU_JSON_PATH, config);
}
