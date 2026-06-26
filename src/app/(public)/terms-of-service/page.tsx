import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { TermsOfServiceContent } from "@/components/shared/legal/TermsOfServiceContent";
import { TERMS_FALLBACK_META } from "@/lib/content/page-fallbacks";

export const metadata = {
  title: "Terms of Service | ReplaceMe",
  description: "Terms of Service for the ReplaceMe marketplace platform.",
};

export const dynamic = "force-dynamic";

export default async function TermsOfServicePage() {
  const cms = await getPublishedPageContent("terms-of-service");
  const meta = { ...TERMS_FALLBACK_META, ...cms?.meta };

  return (
    <LegalPageLayout
      badge={meta.badge ?? TERMS_FALLBACK_META.badge!}
      badgeVariant={meta.badgeVariant ?? "text"}
      title={cms?.title ?? "Terms of Service"}
      lastUpdated={meta.lastUpdated ?? TERMS_FALLBACK_META.lastUpdated!}
      wide={meta.wide ?? true}
    >
      <CmsHtmlContent html={cms?.body} fallback={<TermsOfServiceContent />} />
    </LegalPageLayout>
  );
}
