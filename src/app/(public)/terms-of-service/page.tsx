import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { TermsOfServiceContent } from "@/components/shared/legal/TermsOfServiceContent";
import { TERMS_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Terms of Service — Replaceme Platform Agreement",
  description:
    "Replaceme Terms of Service for Filipino Workers and Employers — covering RA 11967 ID verification, BIR RR 15-2024 tax compliance, Stripe subscriptions, and mandatory internal redress.",
  alternates: { canonical: `${BASE_URL}/terms-of-service` },
  openGraph: {
    title: "Terms of Service — Replaceme",
    description: "Read the Replaceme platform terms of service for employers and Filipino job seekers.",
    url: `${BASE_URL}/terms-of-service`,
    type: "website",
  },
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
