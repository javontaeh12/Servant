#!/usr/bin/env node
// Copies all objects from Supabase Storage (public + private buckets)
// to Cloudflare R2 (iasf-catering + iasf-catering-private), then rewrites
// any baked-in Supabase URLs inside JSON blobs to point at R2.
//
// Usage:
//   node scripts/migrate-supabase-to-r2.mjs

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const SUPA_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const R2_ACCOUNT = (process.env.R2_ACCOUNT_ID || "").trim();
const R2_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_BUCKET = process.env.R2_BUCKET || "iasf-catering";
const R2_PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET || "iasf-catering-private";
const R2_PUBLIC_BASE = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

if (!SUPA_URL || !SUPA_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!R2_ACCOUNT || !R2_KEY || !R2_SECRET || !R2_PUBLIC_BASE) {
  console.error("Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BASE_URL)");
  process.exit(1);
}

const supa = createClient(SUPA_URL, SUPA_KEY);
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_KEY, secretAccessKey: R2_SECRET },
});

const SUPA_PUBLIC_PREFIX = `${SUPA_URL}/storage/v1/object/public/public/`;

async function listAllSupa(bucket, prefix = "") {
  // Recursively list every object in a Supabase bucket, returning full keys
  const out = [];
  const { data, error } = await supa.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  for (const item of data || []) {
    const key = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      // folder
      const sub = await listAllSupa(bucket, key);
      out.push(...sub);
    } else {
      out.push(key);
    }
  }
  return out;
}

async function copyOne(supaBucket, key, r2Bucket) {
  // The "public" bucket has SDK download quirks — fall back to a direct fetch on the public URL
  let buf;
  let contentType = "application/octet-stream";

  if (supaBucket === "public") {
    const url = `${SUPA_URL}/storage/v1/object/public/${supaBucket}/${key}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  skip ${key}: HTTP ${res.status}`);
      return null;
    }
    contentType = res.headers.get("content-type") || contentType;
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    const { data, error } = await supa.storage.from(supaBucket).download(key);
    if (error || !data) {
      console.warn(`  skip ${key}: ${error?.message || "no data"}`);
      return null;
    }
    buf = Buffer.from(await data.arrayBuffer());
    contentType = data.type || contentType;
  }

  // If JSON, rewrite Supabase URLs to R2 URLs
  let body = buf;
  if (contentType.includes("json") || key.endsWith(".json")) {
    let text = buf.toString("utf-8");
    if (text.includes(SUPA_PUBLIC_PREFIX)) {
      text = text.split(SUPA_PUBLIC_PREFIX).join(`${R2_PUBLIC_BASE}/`);
      console.log(`  rewrote URLs in ${key}`);
    }
    body = Buffer.from(text, "utf-8");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return body.length;
}

async function migrateBucket(supaBucket, r2Bucket) {
  console.log(`\n→ Migrating ${supaBucket} → ${r2Bucket}`);
  let keys;
  try {
    keys = await listAllSupa(supaBucket);
  } catch (e) {
    console.warn(`  could not list ${supaBucket}: ${e.message}`);
    return;
  }
  console.log(`  found ${keys.length} object(s)`);
  let bytes = 0;
  for (const key of keys) {
    const n = await copyOne(supaBucket, key, r2Bucket);
    if (n != null) bytes += n;
  }
  console.log(`  copied ~${(bytes / 1024).toFixed(1)} KB`);
}

(async () => {
  await migrateBucket("public", R2_PUBLIC_BUCKET);
  await migrateBucket("private", R2_PRIVATE_BUCKET);
  console.log("\nDone.");
})();
