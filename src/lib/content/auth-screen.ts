import { unstable_cache } from "next/cache";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { PAGE_CONTENT_TAG } from "@/config/page-content";
import {
  AUTH_LOGIN_FALLBACK,
  AUTH_SIGNUP_FALLBACK,
} from "@/lib/content/page-fallbacks";
import type { AuthScreenConfig, AuthScreenSlug } from "@/types/page-content";

function mergeAuthConfig(
  slug: AuthScreenSlug,
  row: Awaited<ReturnType<typeof getPublishedPageContent>>
): AuthScreenConfig {
  const fallback =
    slug === "auth-login" ? AUTH_LOGIN_FALLBACK : AUTH_SIGNUP_FALLBACK;
  const json = row?.contentJson ?? {};

  return {
    headline:
      typeof json.headline === "string" && json.headline.trim()
        ? json.headline
        : fallback.headline,
    description:
      typeof json.description === "string" && json.description.trim()
        ? json.description
        : fallback.description,
    signupPrompt:
      typeof json.signupPrompt === "string"
        ? json.signupPrompt
        : fallback.signupPrompt,
    signupLinkLabel:
      typeof json.signupLinkLabel === "string"
        ? json.signupLinkLabel
        : fallback.signupLinkLabel,
    testimonialQuote:
      typeof json.testimonialQuote === "string"
        ? json.testimonialQuote
        : fallback.testimonialQuote,
    testimonialName:
      typeof json.testimonialName === "string"
        ? json.testimonialName
        : fallback.testimonialName,
    testimonialRole:
      typeof json.testimonialRole === "string"
        ? json.testimonialRole
        : fallback.testimonialRole,
  };
}

export async function getAuthScreenContent(
  slug: AuthScreenSlug
): Promise<AuthScreenConfig> {
  return unstable_cache(
    async () => {
      const row = await getPublishedPageContent(slug);
      return mergeAuthConfig(slug, row);
    },
    [`auth-screen-${slug}`],
    { tags: [PAGE_CONTENT_TAG, `page-content-${slug}`] }
  )();
}
