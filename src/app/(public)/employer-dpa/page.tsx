import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { EmployerDpaContent } from "@/components/shared/legal/EmployerDpaContent";
import { EMPLOYER_DPA_PAGE_META } from "@/lib/data/legal";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Data Processing Agreement | Replaceme",
  description:
    "How Employers and Replaceme share responsibility for Worker personal data after profile unlock, applications, and messaging.",
  alternates: { canonical: `${BASE_URL}/employer-dpa` },
  openGraph: {
    title: "Employer DPA | Replaceme",
    description: "Data processing and sharing terms for Employers on Replaceme.",
    url: `${BASE_URL}/employer-dpa`,
    type: "website",
  },
};

export default function EmployerDpaPage() {
  return (
    <LegalPageLayout
      badge={EMPLOYER_DPA_PAGE_META.badge!}
      badgeVariant={EMPLOYER_DPA_PAGE_META.badgeVariant ?? "pill"}
      title="Employer Data Processing Agreement"
      lastUpdated={EMPLOYER_DPA_PAGE_META.lastUpdated!}
      wide={EMPLOYER_DPA_PAGE_META.wide ?? true}
    >
      <EmployerDpaContent />
    </LegalPageLayout>
  );
}
