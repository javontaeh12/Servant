import { put, list } from "@vercel/blob";

const CREDENTIALS_JSON_PATH = "data/credentials.json";

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
    const { blobs } = await list({ prefix: CREDENTIALS_JSON_PATH });
    if (blobs.length === 0) {
      return {};
    }
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return {};
    }
    return (await response.json()) as StoredCredentials;
  } catch {
    return {};
  }
}

export async function saveCredentials(
  creds: StoredCredentials
): Promise<void> {
  const existing = await getCredentials();
  const merged = { ...existing, ...creds };
  await put(CREDENTIALS_JSON_PATH, JSON.stringify(merged, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Get the Google refresh token from env var (calendar/gmail scopes are set up manually)
export async function getGoogleRefreshToken(): Promise<string> {
  return process.env.GOOGLE_REFRESH_TOKEN || "";
}

// Get the Square access token (stored credentials > env var fallback)
export async function getSquareAccessToken(): Promise<string> {
  const creds = await getCredentials();
  return creds.square?.accessToken || process.env.SQUARE_ACCESS_TOKEN || "";
}
