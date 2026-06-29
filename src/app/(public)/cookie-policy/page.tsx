import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { CookiePolicyContent } from "@/components/shared/legal/CookiePolicyContent";
import { COOKIE_FALLBACK_META } from "@/lib/content/page-fallbacks";

export const metadata = {
  title: "Cookie Policy | ReplaceMe",
  description: "How ReplaceMe uses cookies and how you can manage your preferences.",
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
    >
      <CmsHtmlContent html={cms?.body} fallback={<CookiePolicyContent />} />
    </LegalPageLayout>
  );
}
