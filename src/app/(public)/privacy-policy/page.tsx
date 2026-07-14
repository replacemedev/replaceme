import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { PrivacyPolicyContent } from "@/components/shared/legal/PrivacyPolicyContent";
import { PRIVACY_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Privacy Policy — How Replaceme Handles Your Data",
  description:
    "How Replaceme protects Worker and Employer data under RA 10173, NPC Advisory 2026-02, GDPR, and CCPA — including Stripe PCI payment handling, cross-border transfers (SCCs), and Employer PIC duties after profile unlock.",
  alternates: { canonical: `${BASE_URL}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy — Replaceme",
    description: "Read how Replaceme collects, uses, and protects your personal data.",
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
      wide={meta.wide ?? true}
    >
      <CmsHtmlContent html={cms?.body} fallback={<PrivacyPolicyContent />} />
    </LegalPageLayout>
  );
}
