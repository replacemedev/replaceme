import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { LegalContentPlaceholder } from "@/components/shared/LegalContentPlaceholder";

export const metadata = {
  title: "Terms of Service | ReplaceMe",
  description: "Terms of Service for the ReplaceMe marketplace platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <LegalContentPlaceholder />
    </LegalPageLayout>
  );
}
