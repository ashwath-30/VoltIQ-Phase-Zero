/**
 * Throws a clear, specific error if a required environment variable is
 * missing or empty — instead of letting Supabase, Anthropic, or some
 * other library throw a vaguer, harder-to-diagnose error later on.
 *
 * Use this anywhere a server-only (or public) env var is read directly.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
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
