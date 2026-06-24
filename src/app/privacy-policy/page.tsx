import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { LegalContentPlaceholder } from "@/components/shared/LegalContentPlaceholder";

export const metadata = {
  title: "Privacy Policy | ReplaceMe",
  description: "Privacy Policy for the ReplaceMe marketplace platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <LegalContentPlaceholder />
    </LegalPageLayout>
  );
}
