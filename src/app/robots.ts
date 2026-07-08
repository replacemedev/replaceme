import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/employer/",
          "/worker/",
          "/admin/",
          "/api/",
          "/auth/",
          "/update-password",
          "/signin",
          "/signup",
          "/login",
          "/403",
        ],
      },
      // Allow AI crawlers — they respect robots.txt too
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/employer/", "/worker/", "/admin/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/employer/", "/worker/", "/admin/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/employer/", "/worker/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
