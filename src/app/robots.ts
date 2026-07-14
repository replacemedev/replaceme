import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

/** Paths never exposed to crawlers (auth walls / PII / admin). */
const PRIVATE = [
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
] as const;

type RobotRule = {
  userAgent: string;
  allow: string;
  disallow: string[];
};

/**
 * 2026 AI crawler policy (marketplace override):
 * Allow AI *search index* + *user assistant* bots so jobs get cited in
 * ChatGPT / Perplexity / Claude / AI Overviews. Also allow major training
 * scrapers on public pages — entity presence in future models matters for
 * a hiring marketplace more than training-data fencing. Private paths stay blocked.
 */
const AI_SEARCH_AND_ASSIST = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Gemini-Deep-Research",
  "Google-CloudVertexBot",
  "Bravebot",
  "YouBot",
  "DuckAssistBot",
  "PhindBot",
  "Applebot",
  "Bingbot",
  "Googlebot",
] as const;

const AI_TRAINING_PUBLIC = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

function allowPublic(userAgent: string): RobotRule {
  return { userAgent, allow: "/", disallow: [...PRIVATE] };
}

export default function robots(): MetadataRoute.Robots {
  const rules: RobotRule[] = [
    allowPublic("*"),
    ...AI_SEARCH_AND_ASSIST.map(allowPublic),
    ...AI_TRAINING_PUBLIC.map(allowPublic),
  ];

  return {
    rules,
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
