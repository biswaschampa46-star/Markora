import type { User } from "@supabase/supabase-js";

// Pure helper - must stay free of next/headers and other request-context
// imports because it is also used inside the proxy (middleware).
//
// A user is an admin when their Supabase account has app_metadata.role =
// "admin" (set via the dashboard or scripts/enable-rls.sql), OR their email is
// in the ADMIN_EMAILS allowlist (comma-separated server env var).
export function isAdminUser(user: Pick<User, "email" | "app_metadata">): boolean {
  if (user.app_metadata?.role === "admin") {
    return true;
  }

  const allowlist = process.env.ADMIN_EMAILS ?? "";
  if (!allowlist || !user.email) {
    return false;
  }

  return allowlist
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .includes(user.email.toLowerCase());
}
