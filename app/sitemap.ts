import type { MetadataRoute } from "next";

// Update this to your real production domain once you have one.
const BASE_URL = "https://voltiqx.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = ["", "/about", "/contact", "/login", "/register"];

  return publicPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
