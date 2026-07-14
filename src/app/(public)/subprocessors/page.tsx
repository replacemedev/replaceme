import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { SubprocessorsContent } from "@/components/shared/legal/SubprocessorsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Subprocessors — Replaceme",
  description:
    "List of third-party subprocessors Replaceme uses to deliver the platform (hosting, auth, payments, email, rate limiting, CDN).",
  alternates: { canonical: `${BASE_URL}/subprocessors` },
};

export const dynamic = "force-dynamic";

export default function SubprocessorsPage() {
  return (
    <LegalPageLayout
      badge="Legal"
      badgeVariant="pill"
      title="Subprocessors"
      lastUpdated="14 July 2026"
      wide
    >
      <SubprocessorsContent />
    </LegalPageLayout>
  );
}
