import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { TermsOfServiceContent } from "@/components/shared/legal/TermsOfServiceContent";
import { TERMS_PAGE_META } from "@/lib/data/publicPages";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Terms of Service | Platform Agreement",
  description:
    "Replaceme Terms of Service for Filipino Workers and Employers — covering digital-conduit / non-EOR role, liability caps, indemnification, class-action waiver, RA 11967, BIR RR 15-2024, and global Stripe billing.",
  alternates: { canonical: `${BASE_URL}/terms-of-service` },
  openGraph: {
    title: "Terms of Service | Replaceme",
    description: "Read the Replaceme platform terms of service for employers and Filipino job seekers.",
    url: `${BASE_URL}/terms-of-service`,
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      badge={TERMS_PAGE_META.badge!}
      badgeVariant={TERMS_PAGE_META.badgeVariant ?? "text"}
      title="Terms of Service"
      lastUpdated={TERMS_PAGE_META.lastUpdated!}
      wide={TERMS_PAGE_META.wide ?? true}
    >
      <TermsOfServiceContent />
    </LegalPageLayout>
  );
}
