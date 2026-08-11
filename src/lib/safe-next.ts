// Only allow same-site relative redirects to avoid open-redirect abuse.
// Used by the auth callback route and the login page.
export function sanitizeNextPath(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}
