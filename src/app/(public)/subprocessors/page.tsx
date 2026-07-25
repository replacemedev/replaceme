import Link from "next/link";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { LEGAL_LAST_UPDATED, SUBPROCESSORS } from "@/lib/data/legal";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Subprocessors | Replaceme",
  description:
    "Third-party subprocessors Replaceme uses to operate the marketplace, including payments, email, and infrastructure.",
  alternates: { canonical: `${BASE_URL}/subprocessors` },
  openGraph: {
    title: "Subprocessors | Replaceme",
    description: "Current list of Replaceme subprocessors and their purposes.",
    url: `${BASE_URL}/subprocessors`,
    type: "website",
  },
};

export default function SubprocessorsPage() {
  return (
    <LegalPageLayout
      badge="Legal"
      badgeVariant="pill"
      title="Subprocessors"
      lastUpdated={LEGAL_LAST_UPDATED}
      wide
    >
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:p-10">
        <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-[17px]">
          Replaceme engages the following subprocessors to help deliver the Platform. Each processor
          is bound by contractual confidentiality and security obligations. This list supplements our{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#006e2f] hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/employer-dpa" className="font-semibold text-[#006e2f] hover:underline">
            Employer DPA
          </Link>
          .
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 pr-4 font-bold text-slate-900">Subprocessor</th>
                <th className="pb-3 pr-4 font-bold text-slate-900">Purpose</th>
                <th className="pb-3 font-bold text-slate-900">Region</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((row) => (
                <tr key={row.name} className="border-b border-slate-100 align-top">
                  <td className="py-3.5 pr-4 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{row.purpose}</td>
                  <td className="py-3.5 text-slate-600">{row.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-slate-500">
          Questions about subprocessors:{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            support@replaceme.ph
          </a>
          .
        </p>
      </article>
    </LegalPageLayout>
  );
}
