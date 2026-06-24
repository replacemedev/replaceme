import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { TermsOfServiceContent } from "@/components/shared/legal/TermsOfServiceContent";

export const metadata = {
  title: "Terms of Service | ReplaceMe",
  description: "Terms of Service for the ReplaceMe marketplace platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      badge="Legal Document"
      badgeVariant="text"
      title="Terms of Service"
      lastUpdated="January 24, 2026"
      wide
    >
      <TermsOfServiceContent />
    </LegalPageLayout>
  );
}
