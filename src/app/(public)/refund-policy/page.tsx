import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { RefundPolicyContent } from "@/components/shared/legal/RefundPolicyContent";
import { REFUND_PAGE_META } from "@/lib/data/publicPages";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Refund Policy | Employer Plan Billing",
  description:
    "Replaceme employer subscription refund policy — billing errors, mandatory-law carve-outs, cancel-anytime access, and Australian merchant-of-record billing via Stripe.",
  alternates: { canonical: `${BASE_URL}/refund-policy` },
  openGraph: {
    title: "Refund Policy | Replaceme",
    description:
      "How refunds work for Replaceme employer subscription plans billed in USD via Stripe.",
    url: `${BASE_URL}/refund-policy`,
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      badge={REFUND_PAGE_META.badge!}
      badgeVariant={REFUND_PAGE_META.badgeVariant ?? "pill"}
      title="Refund Policy"
      lastUpdated={REFUND_PAGE_META.lastUpdated!}
      wide={REFUND_PAGE_META.wide ?? true}
    >
      <RefundPolicyContent />
    </LegalPageLayout>
  );
}
