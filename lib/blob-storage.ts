import { put, list } from "@vercel/blob";

/**
 * Shared utilities for reading/writing JSON data to Vercel Blob Storage.
 *
 * All domain-specific storage modules (menu, pricing, gallery, business,
 * specialty) delegate to these helpers so the try/catch + fetch + fallback
 * boilerplate lives in one place.
 */

export interface ReadBlobOptions {
  /** When true the fetch uses `cache: "no-store"` to bypass CDN caching. */
  noCache?: boolean;
}

/**
 * Read a JSON value from Vercel Blob Storage, falling back to a default.
 *
 * 1. Lists blobs matching `prefix`.
 * 2. Fetches the first blob's URL and parses the response as JSON.
 * 3. Returns `fallback` if no blob exists, the fetch fails, or parsing throws.
 */
export async function readBlob<T>(
  prefix: string,
  fallback: T,
  options?: ReadBlobOptions
): Promise<T> {
  try {
    const { blobs } = await list({ prefix });
    if (blobs.length === 0) {
      return fallback;
    }
    const fetchOptions: RequestInit | undefined = options?.noCache
      ? { cache: "no-store" }
      : undefined;
    const response = await fetch(blobs[0].url, fetchOptions);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON value to Vercel Blob Storage (overwrite, no random suffix).
 *
 * This covers the common case used by menu, business, gallery, and specialty
 * storage. Pricing uses a different strategy (random suffix + cleanup) and
 * therefore has its own write implementation.
 */
export async function writeBlob<T>(path: string, data: T): Promise<void> {
  await put(path, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
