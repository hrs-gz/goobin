const DEFAULT_AUTH_REDIRECT = "/history";

/** Validates post-login path: relative app route only (no open redirect). */
export function safeAuthRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  return next;
}
