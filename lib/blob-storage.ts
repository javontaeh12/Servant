import { supabase, PUBLIC_BUCKET } from "./supabase";

/**
 * Shared utilities for reading/writing JSON data to Supabase Storage.
 *
 * All domain-specific storage modules (menu, pricing, gallery, business,
 * specialty) delegate to these helpers so the try/catch + fetch + fallback
 * boilerplate lives in one place.
 */

export interface ReadBlobOptions {
  /** Kept for API compat — Supabase always fetches fresh via download(). */
  noCache?: boolean;
}

/**
 * Read a JSON value from Supabase Storage, falling back to a default.
 */
export async function readBlob<T>(
  path: string,
  fallback: T,
  _options?: ReadBlobOptions
): Promise<T> {
  try {
    const { data, error } = await supabase.storage
      .from(PUBLIC_BUCKET)
      .download(path);
    if (error || !data) return fallback;
    const text = await data.text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON value to Supabase Storage (upsert).
 */
export async function writeBlob<T>(path: string, data: T): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  await supabase.storage.from(PUBLIC_BUCKET).upload(path, body, {
    contentType: "application/json",
    upsert: true,
  });
}
