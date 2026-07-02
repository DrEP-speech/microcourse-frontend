/**
 * Extracted so tests can mock this function without fighting jsdom's
 * window.location restrictions.
 */
export function redirectToSessionExpiredLogin(): void {
  if (typeof window !== "undefined") {
    window.location.assign("/login?reason=session_expired");
  }
}
