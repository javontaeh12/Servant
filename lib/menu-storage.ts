import { promises as fs } from "fs";
import path from "path";
import { MenuConfig } from "./types";

const MENU_FILE = path.join(process.cwd(), "data", "menu.json");

export async function readMenu(): Promise<MenuConfig> {
  const raw = await fs.readFile(MENU_FILE, "utf-8");
  return JSON.parse(raw) as MenuConfig;
}

export async function writeMenu(config: MenuConfig): Promise<void> {
  await fs.writeFile(MENU_FILE, JSON.stringify(config, null, 2), "utf-8");
}
