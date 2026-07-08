import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { PrivacyPolicyContent } from "@/components/shared/legal/PrivacyPolicyContent";
import { PRIVACY_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Privacy Policy — How Replace Me Handles Your Data",
  description:
    "Replace Me's privacy policy explains what personal data we collect, how it is used, and your rights as an employer or job seeker on the platform.",
  alternates: { canonical: `${BASE_URL}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy — Replace Me",
    description: "Read how Replace Me collects, uses, and protects your personal data.",
    url: `${BASE_URL}/privacy-policy`,
    type: "website",
  },
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
