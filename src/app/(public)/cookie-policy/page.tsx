import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { CookiePolicyContent } from "@/components/shared/legal/CookiePolicyContent";
import { COOKIE_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Cookie Policy | How Replaceme Uses Cookies",
  description:
    "Global Cookie Policy for Replaceme — necessary, analytics, and marketing cookies with NPC- and GDPR-aligned opt-in consent for users in the Philippines and worldwide.",
  alternates: { canonical: `${BASE_URL}/cookie-policy` },
  openGraph: {
    title: "Cookie Policy | Replaceme",
    description: "Read Replaceme's cookie policy and learn how to manage your cookie preferences.",
    url: `${BASE_URL}/cookie-policy`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function CookiePolicyPage() {
  const cms = await getPublishedPageContent("cookie-policy");
  const meta = { ...COOKIE_FALLBACK_META, ...cms?.meta };

  return (
    <LegalPageLayout
      badge={meta.badge ?? COOKIE_FALLBACK_META.badge!}
      badgeVariant={meta.badgeVariant ?? "pill"}
      title={cms?.title ?? "Cookie Policy"}
      lastUpdated={meta.lastUpdated ?? COOKIE_FALLBACK_META.lastUpdated!}
      wide={meta.wide ?? true}
    >
      <CmsHtmlContent html={cms?.body} fallback={<CookiePolicyContent />} />
    </LegalPageLayout>
  );
}
