/** @type {import('next').NextConfig} */
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
