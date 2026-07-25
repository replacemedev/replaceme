import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { PrivacyPolicyContent } from "@/components/shared/legal/PrivacyPolicyContent";
import { PRIVACY_PAGE_META } from "@/lib/data/publicPages";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Privacy Policy | How Replaceme Handles Your Data",
  description:
    "How Replaceme protects Worker and Employer data under RA 10173, NPC Advisory 2026-02, GDPR, and CCPA — including Stripe PCI payment handling, cross-border transfers (SCCs), and Employer PIC duties after profile unlock.",
  alternates: { canonical: `${BASE_URL}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy | Replaceme",
    description: "Read how Replaceme collects, uses, and protects your personal data.",
    url: `${BASE_URL}/privacy-policy`,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      badge={PRIVACY_PAGE_META.badge!}
      badgeVariant={PRIVACY_PAGE_META.badgeVariant ?? "pill"}
      title="Privacy Policy"
      lastUpdated={PRIVACY_PAGE_META.lastUpdated!}
      wide={PRIVACY_PAGE_META.wide ?? true}
    >
      <PrivacyPolicyContent />
    </LegalPageLayout>
  );
}
