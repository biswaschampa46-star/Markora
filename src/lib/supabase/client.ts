"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

export function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}

// Shared client-side sign out used by the header account menu and the mobile
// menu. Does nothing when Supabase is not configured.
export async function signOutUser() {
  const supabase = createClient();
  if (!supabase) {
    return;
  }
  await supabase.auth.signOut();
}
