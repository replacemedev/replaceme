import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { CookiePolicyContent } from "@/components/shared/legal/CookiePolicyContent";
import { COOKIE_PAGE_META } from "@/lib/data/publicPages";
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

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      badge={COOKIE_PAGE_META.badge!}
      badgeVariant={COOKIE_PAGE_META.badgeVariant ?? "pill"}
      title="Cookie Policy"
      lastUpdated={COOKIE_PAGE_META.lastUpdated!}
      wide={COOKIE_PAGE_META.wide ?? true}
    >
      <CookiePolicyContent />
    </LegalPageLayout>
  );
}
