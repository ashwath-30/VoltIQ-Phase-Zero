/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy — tells the browser exactly which sources of
// scripts, styles, images, and network connections are allowed to run
// on the page. This is real protection against a category of attack
// (cross-site scripting) that the other headers below don't cover.
//
// Honest tradeoff: a maximally strict CSP requires per-request "nonces"
// threaded through every page, which is more setup than is safe to add
// without being able to test it live. This version keeps 'unsafe-inline'
// for scripts/styles (needed for some of Next.js's own internals) —
// meaningfully better than no CSP at all, not a perfect lockdown.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Supabase and Anthropic are the only external services our own
  // client-side code ever talks to directly. Stripe is called only from
  // our server (Node.js), never from the browser, so it doesn't need to
  // be listed here at all.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        // Applies to every route in the app
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Stops the site from being embedded in an <iframe> on another
          // domain (protects against "clickjacking" attacks).
          { key: "X-Frame-Options", value: "DENY" },
          // Stops the browser from guessing file types differently than
          // the server intended — a minor but real hardening step.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limits how much referrer info leaks to other sites when a
          // user clicks a link away from VoltIQ.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Explicitly disables browser features this app never uses,
          // reducing what a compromised dependency could abuse.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Tells browsers to only ever connect over HTTPS, once deployed.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
