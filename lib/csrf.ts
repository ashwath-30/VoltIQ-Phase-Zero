import type { NextRequest } from "next/server";

/**
 * A malicious site (evil.com) can't read your VoltIQX cookies, but it
 * CAN trick a logged-in visitor's browser into silently submitting a
 * request to voltiqx's own API — the browser attaches the real session
 * cookies automatically. This is called Cross-Site Request Forgery
 * (CSRF). Checking the request's Origin header stops it: a request
 * actually coming from our own pages will show our own origin; a
 * request forged from evil.com will show evil.com's origin instead.
 *
 * If the Origin header is missing entirely, this allows the request
 * through rather than blocking it — some legitimate same-origin
 * requests can omit it depending on browser/context, and it's safer to
 * not risk breaking real functionality than to guess at a stricter rule
 * that hasn't been tested live.
 *
 * Use this in every state-changing (POST/PUT/DELETE) route handler
 * EXCEPT the Stripe webhook, which is correctly verified a different
 * way (signature verification) since it's called by Stripe's servers,
 * not a browser, and will never have a matching Origin.
 */
export function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  return origin === requestOrigin;
}
