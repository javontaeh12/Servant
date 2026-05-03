import { getPublicUrl, uploadObject } from "./r2";

/**
 * Shared utilities for reading/writing JSON data to R2.
 *
 * All domain-specific storage modules (menu, pricing, gallery, business,
 * specialty) delegate to these helpers so the try/catch + fetch + fallback
 * boilerplate lives in one place.
 */

export interface ReadBlobOptions {
  noCache?: boolean;
}

/**
 * Read a JSON value from R2, falling back to a default.
 * Uses a fetch on the public URL (avoids needing read auth on hot paths).
 */
export async function readBlob<T>(
  path: string,
  fallback: T,
  _options?: ReadBlobOptions
): Promise<T> {
  try {
    const url = getPublicUrl(path);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON value to R2 (upsert).
 */
export async function writeBlob<T>(path: string, data: T): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  await uploadObject(path, body, "application/json");
}
