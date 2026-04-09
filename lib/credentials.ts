import { put, get } from "@vercel/blob";

const CREDENTIALS_JSON_PATH = "data/credentials.json";

export interface StoredCredentials {
  square?: {
    accessToken: string;
    refreshToken?: string;
    merchantId?: string;
    expiresAt?: string;
    connectedAt: string;
    connectedBy?: string;
  };
}

export async function getCredentials(): Promise<StoredCredentials> {
  try {
    const result = await get(CREDENTIALS_JSON_PATH, { access: "private" });
    if (!result) {
      return {};
    }
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as StoredCredentials;
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
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Check if the Square access token is expired (or will expire within 5 minutes)
function isSquareTokenExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false; // No expiry info — assume still valid
  const expiryTime = new Date(expiresAt).getTime();
  const bufferMs = 5 * 60 * 1000; // 5-minute buffer
  return Date.now() >= expiryTime - bufferMs;
}

// Refresh the Square access token using the refresh token
async function refreshSquareToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  merchantId?: string;
} | null> {
  const clientId = process.env.SQUARE_APPLICATION_ID;
  const clientSecret = process.env.SQUARE_APPLICATION_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "Square OAuth refresh failed: SQUARE_APPLICATION_ID or SQUARE_APPLICATION_SECRET not set"
    );
    return null;
  }

  try {
    const response = await fetch("https://connect.squareup.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Square token refresh failed:", response.status, errorBody);
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      merchantId: data.merchant_id,
    };
  } catch (error) {
    console.error("Square token refresh error:", error);
    return null;
  }
}

// Get the Square access token, refreshing automatically if expired
// Falls back to SQUARE_API_KEY env var if no OAuth credentials are stored
export async function getSquareAccessToken(): Promise<string> {
  const creds = await getCredentials();

  // If no OAuth credentials stored, fall back to API key from env
  if (!creds.square?.accessToken) {
    return process.env.SQUARE_API_KEY || "";
  }

  // If the token is expired and we have a refresh token, auto-refresh
  if (
    isSquareTokenExpired(creds.square.expiresAt) &&
    creds.square.refreshToken
  ) {
    const refreshed = await refreshSquareToken(creds.square.refreshToken);
    if (refreshed) {
      await saveCredentials({
        square: {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
          merchantId: refreshed.merchantId || creds.square.merchantId,
          connectedAt: creds.square.connectedAt,
        },
      });
      return refreshed.accessToken;
    }
    // Refresh failed — fall back to API key if available, otherwise use expired token
    console.warn(
      "Square token refresh failed; trying SQUARE_API_KEY fallback"
    );
    return process.env.SQUARE_API_KEY || creds.square.accessToken;
  }

  return creds.square.accessToken;
}

// Remove the stored Square credentials
export async function removeSquareCredentials(): Promise<void> {
  const existing = await getCredentials();
  delete existing.square;
  await put(CREDENTIALS_JSON_PATH, JSON.stringify(existing, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
