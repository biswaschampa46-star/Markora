import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./config";

// Server-side Supabase client for use in Server Components, Route Handlers
// and Server Actions. Returns null when Supabase env vars are not configured
// yet, so the rest of the app can render a friendly setup message instead of
// crashing.
export async function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component - safe to ignore because the
          // middleware refreshes the session on every request.
        }
      },
    },
  });
}

// Returns the currently logged-in user (public site or admin).
export async function getUser() {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getAdminUser() {
  return getUser();
}
