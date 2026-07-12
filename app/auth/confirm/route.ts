import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_TIMESTAMP_COOKIE } from "@/lib/session-expiry";

// This is what the link in the "confirm your email" message actually
// points to (see README for the one-time Supabase email template edit
// this requires). It verifies the token Supabase generated, which is
// what actually activates the account — until this succeeds, the
// account can't log in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Confirming email establishes a real session, same as a manual
      // login — start the 24-hour clock here too (set server-side,
      // since this route has no browser JS to run document.cookie).
      response.cookies.set(LOGIN_TIMESTAMP_COOKIE, String(Date.now()), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation-failed`);
}
