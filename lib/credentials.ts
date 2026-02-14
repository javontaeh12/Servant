import fs from "fs/promises";
import path from "path";
import { withFileLock } from "./file-lock";

const CREDENTIALS_PATH = path.join(process.cwd(), "data", "credentials.json");

export interface StoredCredentials {
  google?: {
    refreshToken: string;
    email: string;
    name: string;
    connectedAt: string;
  };
  square?: {
    accessToken: string;
    refreshToken?: string;
    merchantId?: string;
    expiresAt?: string;
    connectedAt: string;
  };
}

export async function getCredentials(): Promise<StoredCredentials> {
  try {
    const data = await fs.readFile(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveCredentials(
  creds: StoredCredentials
): Promise<void> {
  await withFileLock(CREDENTIALS_PATH, async () => {
    const existing = await getCredentials();
    const merged = { ...existing, ...creds };
    await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(merged, null, 2));
  });
}

// Get the Google refresh token (stored credentials > env var fallback)
export async function getGoogleRefreshToken(): Promise<string> {
  const creds = await getCredentials();
  return creds.google?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN || "";
}

// Get the Square access token (stored credentials > env var fallback)
export async function getSquareAccessToken(): Promise<string> {
  const creds = await getCredentials();
  return creds.square?.accessToken || process.env.SQUARE_ACCESS_TOKEN || "";
}
