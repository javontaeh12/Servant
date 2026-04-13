import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const PUBLIC_BUCKET = "public";
export const PRIVATE_BUCKET = "private";

/** Build the full public URL for a file in the public bucket. */
export function getPublicUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${PUBLIC_BUCKET}/${path}`;
}
