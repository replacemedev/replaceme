import { PublicFaqPage } from "@/components/shared/faq/PublicFaqPage";
import {
  WORKER_FAQ_FALLBACK,
  WORKER_FAQ_FALLBACK_META,
} from "@/lib/content/faq-fallbacks";

export const metadata = {
  title: "Worker FAQs | ReplaceMe",
  description: "Frequently asked questions for jobseekers on ReplaceMe.",
};

export const dynamic = "force-dynamic";

export default function WorkerFaqPage() {
  return (
    <PublicFaqPage
      slug="worker-faq"
      defaultTitle="Worker FAQs"
      fallback={WORKER_FAQ_FALLBACK}
      fallbackMeta={WORKER_FAQ_FALLBACK_META}
    />
  );
}
