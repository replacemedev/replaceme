import { unstable_cache } from "next/cache";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { PAGE_CONTENT_TAG } from "@/config/page-content";
import type { AuthScreenConfig, AuthScreenSlug } from "@/types/page-content";

const EMPTY_AUTH_SCREEN: AuthScreenConfig = {
  headline: "",
  description: "",
  signupPrompt: "",
  signupLinkLabel: "",
  testimonialQuote: "",
  testimonialName: "",
  testimonialRole: "",
};

function mapAuthConfig(
  json: Record<string, unknown>
): AuthScreenConfig {
  return {
    headline:
      typeof json.headline === "string" ? json.headline.trim() : "",
    description:
      typeof json.description === "string" ? json.description.trim() : "",
    signupPrompt:
      typeof json.signupPrompt === "string" ? json.signupPrompt : "",
    signupLinkLabel:
      typeof json.signupLinkLabel === "string" ? json.signupLinkLabel : "",
    testimonialQuote:
      typeof json.testimonialQuote === "string" ? json.testimonialQuote : "",
    testimonialName:
      typeof json.testimonialName === "string" ? json.testimonialName : "",
    testimonialRole:
      typeof json.testimonialRole === "string" ? json.testimonialRole : "",
  };
}

export async function getAuthScreenContent(
  slug: AuthScreenSlug
): Promise<AuthScreenConfig> {
  return unstable_cache(
    async () => {
      const row = await getPublishedPageContent(slug);
      if (!row) return EMPTY_AUTH_SCREEN;
      return mapAuthConfig(row.contentJson ?? {});
    },
    [`auth-screen-${slug}`],
    { tags: [PAGE_CONTENT_TAG, `page-content-${slug}`] }
  )();
}

export function isAuthMarketingConfigured(content: AuthScreenConfig): boolean {
  return Boolean(
    content.headline?.trim() ||
      content.description?.trim() ||
      content.testimonialQuote?.trim()
  );
}
