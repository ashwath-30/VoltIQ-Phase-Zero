import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing behind login should be indexed by search engines —
        // these are personal dashboards, not public content.
        disallow: [
          "/dashboard",
          "/upload",
          "/analytics",
          "/assistant",
          "/reports",
          "/notifications",
          "/profile",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: "https://voltiqx.app/sitemap.xml",
  };
}
