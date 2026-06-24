import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { PrivacyPolicyContent } from "@/components/shared/legal/PrivacyPolicyContent";

export const metadata = {
  title: "Privacy Policy | ReplaceMe",
  description: "Privacy Policy for the ReplaceMe marketplace platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      badge="Legal"
      badgeVariant="pill"
      title="Privacy Policy"
      lastUpdated="January 26, 2026"
    >
      <PrivacyPolicyContent />
    </LegalPageLayout>
  );
}
