/**
 * Throws a clear, specific error if a required environment variable is
 * missing or empty — instead of letting Supabase, Anthropic, or some
 * other library throw a vaguer, harder-to-diagnose error later on.
 *
 * IMPORTANT: always call this as `requireEnv(process.env.SOME_VAR, "SOME_VAR")`
 * — pass the value read via a literal `process.env.X` expression, not a
 * dynamically-looked-up one. Next.js can only replace `NEXT_PUBLIC_` variables
 * with their real value in browser code when it sees that exact literal
 * pattern written out at build time; a computed lookup like
 * `process.env[name]` is invisible to that process and would silently
 * leave the value undefined in the browser bundle.
 */
export function requireEnv(value: string | undefined, name: string): string {
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to your .env.local file (see .env.local.example for the full list), ` +
        `then restart your dev server. If this is happening in production, add it ` +
        `under your Vercel project's Settings -> Environment Variables instead.`
    );
  }
  return value;
}
