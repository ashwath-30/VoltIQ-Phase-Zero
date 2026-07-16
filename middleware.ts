import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";
import { LOGIN_TIMESTAMP_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/session-expiry";

// Pages that require a logged-in user
const protectedPaths = [
  "/dashboard",
  "/upload",
  "/analytics",
  "/assistant",
  "/reports",
  "/notifications",
  "/profile",
  "/settings",
  "/upgrade",
];

// Pages a logged-in user shouldn't see (send them to the dashboard
// instead) — deliberately just "/login", NOT "/register". Clicking
// "Sign Up" should always show the registration form, even if there's
// an existing session for a different account — otherwise there'd be no
// way to create a second account without first manually logging out.
const authOnlyPaths = ["/login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, any> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  let effectiveUser = user;

  // Real 24-hour session cap, enforced on top of (and independently of)
  // however long Supabase's own session would otherwise silently keep
  // refreshing for. If it's been more than 24 hours since the last real
  // login, force a genuine sign-out rather than letting the session
  // quietly continue.
  if (user) {
    const loginTimestampCookie = request.cookies.get(LOGIN_TIMESTAMP_COOKIE)?.value;
    const loginTimestamp = loginTimestampCookie ? parseInt(loginTimestampCookie, 10) : null;
    const sessionExpired = !loginTimestamp || Date.now() - loginTimestamp > SESSION_MAX_AGE_MS;

    if (sessionExpired) {
      await supabase.auth.signOut();
      effectiveUser = null;
      response.cookies.delete(LOGIN_TIMESTAMP_COOKIE);
    }
  }

  if (!effectiveUser && protectedPaths.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    // Carry over any cookie changes (e.g. the sign-out above) onto the
    // redirect response, since redirects are otherwise a fresh response.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (effectiveUser && authOnlyPaths.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
