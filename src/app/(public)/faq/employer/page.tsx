import { PublicFaqPage } from "@/components/shared/faq/PublicFaqPage";
import {
  EMPLOYER_FAQ_FALLBACK,
  EMPLOYER_FAQ_FALLBACK_META,
} from "@/lib/content/faq-fallbacks";

export const metadata = {
  title: "Employer FAQs | ReplaceMe",
  description: "Frequently asked questions for employers hiring on ReplaceMe.",
};

export const dynamic = "force-dynamic";

export default function EmployerFaqPage() {
  return (
    <PublicFaqPage
      slug="employer-faq"
      defaultTitle="Employer FAQs"
      fallback={EMPLOYER_FAQ_FALLBACK}
      fallbackMeta={EMPLOYER_FAQ_FALLBACK_META}
    />
  );
}
