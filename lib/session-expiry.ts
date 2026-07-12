// Supabase's own session normally refreshes silently and stays valid
// indefinitely. To enforce a real 24-hour "you must log in again" limit
// on top of that, we track our own timestamp of the last real login and
// check it in middleware — separate from (and stricter than) Supabase's
// own session lifetime.
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const LOGIN_TIMESTAMP_COOKIE = "voltiqx_login_at";

// Call this right after a successful login or an immediately-active
// signup (i.e. whenever a real session actually starts). Client-side
// only — middleware reads the cookie this sets.
export function markLoginTimestamp() {
  document.cookie = `${LOGIN_TIMESTAMP_COOKIE}=${Date.now()}; path=/; max-age=${
    30 * 24 * 60 * 60
  }; SameSite=Lax`;
}

export function clearLoginTimestamp() {
  document.cookie = `${LOGIN_TIMESTAMP_COOKIE}=; path=/; max-age=0`;
}
