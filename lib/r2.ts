import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

export const R2_BUCKET = process.env.R2_BUCKET || "iasf-catering";
export const R2_PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET || "iasf-catering-private";
export const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

export function getPublicUrl(path: string): string {
  return `${R2_PUBLIC_BASE_URL}/${path}`;
}

export async function uploadObject(
  path: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  bucket: string = R2_BUCKET
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getObjectText(path: string, bucket: string = R2_BUCKET): Promise<string | null> {
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: path }));
    if (!out.Body) return null;
    return await out.Body.transformToString();
  } catch {
    return null;
  }
}

export async function deleteObject(path: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: path }));
}

export async function deleteObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: paths.map((Key) => ({ Key })) },
    })
  );
}

export async function listObjects(prefix: string, search?: string): Promise<{ name: string }[]> {
  const out = await s3.send(
    new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix })
  );
  const contents = out.Contents || [];
  const names = contents
    .map((c) => (c.Key || "").replace(`${prefix.replace(/\/$/, "")}/`, ""))
    .filter((n) => n.length > 0);
  return (search ? names.filter((n) => n.includes(search)) : names).map((name) => ({ name }));
}

/** Extract object key from a public URL, supporting both R2 and legacy Supabase URLs. */
export function extractStoragePath(url: string): string | null {
  if (R2_PUBLIC_BASE_URL && url.startsWith(R2_PUBLIC_BASE_URL + "/")) {
    return url.slice(R2_PUBLIC_BASE_URL.length + 1);
  }
  // Legacy Supabase URLs (in case any old data still references them)
  const supaMarker = "/storage/v1/object/public/public/";
  const idx = url.indexOf(supaMarker);
  if (idx !== -1) return url.slice(idx + supaMarker.length);
  return null;
}
