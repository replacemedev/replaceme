import type { MetadataRoute } from "next";
import { getPublicJobListings } from "@/actions/public/growth";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

/** Static public routes with their SEO priority and change frequency */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/jobs`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.95,
  },
  {
    url: `${BASE_URL}/pricing`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/companies`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/community`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/faq/employer`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    url: `${BASE_URL}/faq/worker`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    url: `${BASE_URL}/help`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.65,
  },
  {
    url: `${BASE_URL}/privacy-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/terms-of-service`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/cookie-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dynamically fetch active job listings for /jobs/[id] entries
  let jobRoutes: MetadataRoute.Sitemap = [];

  try {
    const jobs = await getPublicJobListings();
    jobRoutes = jobs.map((job) => ({
      url: `${BASE_URL}/jobs/${job.id}`,
      lastModified: new Date(job.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
  } catch {
    // Silently fall back to static-only sitemap if DB is unavailable during build
  }

  return [...STATIC_ROUTES, ...jobRoutes];
}
