import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

// Public Supabase Storage bucket that holds product images. Create it in the
// Supabase dashboard (Storage -> New bucket, mark it Public) with this exact
// name.
export const PRODUCT_IMAGES_BUCKET = "product-images";

// Server-side Supabase client used ONLY for storage operations (never exposed
// to the browser). Returns null when Supabase is not configured yet.
//
// - If SUPABASE_SERVICE_ROLE_KEY is set, uploads/removals bypass RLS entirely
//   (recommended - the service role key must stay server-only).
// - Otherwise it falls back to the anon key, which requires INSERT/DELETE
//   policies on storage.objects for the bucket (see README).
export function getStorageClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(env.url, serviceRoleKey || env.anonKey, {
    auth: { persistSession: false },
  });
}
