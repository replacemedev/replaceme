import type { Metadata } from "next";
import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { fetchPublicStaffDirectory } from "@/actions/admin/profile";
import { StaffDirectoryGrid } from "@/components/shared/staff/StaffDirectoryGrid";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Our Team | Replaceme",
  description:
    "Meet the Replaceme people behind Trust & Safety and platform operations. Opted-in staff profiles only.",
  alternates: { canonical: `${BASE_URL}/team` },
  openGraph: {
    title: "Our Team | Replaceme",
    description:
      "Meet the Replaceme people behind Trust & Safety and platform operations.",
    url: `${BASE_URL}/team`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function PublicTeamPage() {
  const members = await fetchPublicStaffDirectory();

  return (
    <main className={`${PUBLIC_PAGE_TOP} min-h-[calc(100dvh-4rem)] flex-1 bg-[#f8fafe]`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#22c55e]">
          Company
        </p>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Our team
        </h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-slate-500">
          People who keep Replaceme safe and running. Profiles appear here only
          when a teammate opts in — no emails or phone numbers are published.
        </p>
        <StaffDirectoryGrid
          members={members}
          emptyMessage="No public staff profiles yet. Check back soon."
        />
      </div>
    </main>
  );
}
