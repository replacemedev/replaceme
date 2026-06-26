import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { PrivacyPolicyContent } from "@/components/shared/legal/PrivacyPolicyContent";
import { PRIVACY_FALLBACK_META } from "@/lib/content/page-fallbacks";

export const metadata = {
  title: "Privacy Policy | ReplaceMe",
  description: "Privacy Policy for the ReplaceMe marketplace platform.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const cms = await getPublishedPageContent("privacy-policy");
  const meta = { ...PRIVACY_FALLBACK_META, ...cms?.meta };

  return (
    <LegalPageLayout
      badge={meta.badge ?? PRIVACY_FALLBACK_META.badge!}
      badgeVariant={meta.badgeVariant ?? "pill"}
      title={cms?.title ?? "Privacy Policy"}
      lastUpdated={meta.lastUpdated ?? PRIVACY_FALLBACK_META.lastUpdated!}
    >
      <CmsHtmlContent html={cms?.body} fallback={<PrivacyPolicyContent />} />
    </LegalPageLayout>
  );
}
