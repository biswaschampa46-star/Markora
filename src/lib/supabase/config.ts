export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}

// Canonical site URL used for auth redirects. Prefer the NEXT_PUBLIC_SITE_URL
// env var so production always redirects to the exact URL that is allowlisted
// in the Supabase dashboard (Authentication -> URL Configuration). Falls back
// to the browser origin, which is correct on the deployed site and in local
// development.
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}
