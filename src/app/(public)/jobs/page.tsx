import { getPublicJobListings } from "@/actions/public/growth";
import { PublicJobBoardClient } from "@/components/public/PublicJobBoardClient";
import { JsonLd } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Remote Jobs in the Philippines \u2014 Browse Active Roles",
  description:
    "Browse active remote job listings on Replaceme. Find full-time, long-term remote roles across tech, design, marketing, and operations posted by global employers hiring Filipino professionals.",
  keywords: [
    "remote jobs Philippines",
    "Filipino remote work",
    "work from home jobs Philippines",
    "online jobs Philippines",
    "remote jobs for Filipinos",
  ],
  alternates: {
    canonical: `${BASE_URL}/jobs`,
  },
  openGraph: {
    title: "Remote Jobs in the Philippines \u2014 Browse Active Roles",
    description:
      "Find full-time and long-term remote roles posted by global employers. Apply directly — no agency fees, no middlemen.",
    url: `${BASE_URL}/jobs`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function PublicJobsPage() {
  const jobs = await getPublicJobListings();

  // ItemList helps Google for Jobs + AI engines discover active listings.
  const itemList =
    jobs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Active remote jobs on Replaceme",
          numberOfItems: jobs.length,
          itemListElement: jobs.slice(0, 50).map((job, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}/jobs/${job.id}`,
            name: `${job.title} at ${job.companyName}`,
          })),
        }
      : null;

  return (
    <>
      {itemList ? <JsonLd schema={itemList} /> : null}
      <PublicJobBoardClient jobs={jobs} />
    </>
  );
}
