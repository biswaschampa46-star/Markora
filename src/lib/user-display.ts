// Client-safe helpers for rendering the logged-in user's name/initial.
// The Supabase User type is structurally compatible with PublicUser.
export type PublicUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

export function getUserDisplayName(user: Exclude<PublicUser, null>): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }
  if (user.email) {
    return user.email.split("@")[0];
  }
  return "ইউজার";
}

export function getUserInitial(user: Exclude<PublicUser, null>): string {
  return getUserDisplayName(user).charAt(0).toUpperCase();
}
