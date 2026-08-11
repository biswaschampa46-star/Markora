import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

// Server-side Supabase admin helpers. These use the SUPABASE_SERVICE_ROLE_KEY
// and must never be imported from client components.

// Reuse a single admin client across calls instead of creating one per lookup.
let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

function getAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const env = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!env || !serviceRoleKey) {
    return null;
  }

  adminClient = createSupabaseClient(env.url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return adminClient;
}

// Best-effort lookup of a Supabase Auth user by id (used to show a customer's
// live account email in the admin panel). Returns null when the service role
// key is not configured or the lookup fails - callers fall back to the email
// captured on the order rows.
export async function getAuthUserById(userId: string) {
  const admin = getAdminClient();

  if (!admin) {
    return null;
  }

  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
