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
      lastUpdated="October 24, 2024"
      wide
    >
      <TermsOfServiceContent />
    </LegalPageLayout>
  );
}
