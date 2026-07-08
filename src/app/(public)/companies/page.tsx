import { getPublicCompanyDirectory } from "@/actions/public/growth";
import { PublicCompanyDirectory } from "@/components/public/PublicCompanyDirectory";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Company Directory \u2014 Employers Hiring Filipino Remote Talent",
  description:
    "Browse companies actively hiring Filipino remote professionals on Replace Me. Discover employers across tech, e-commerce, marketing, and operations who recruit directly without agency fees.",
  keywords: [
    "companies hiring Filipinos remotely",
    "employers hiring Filipino talent",
    "remote hiring companies Philippines",
    "global employers Replace Me",
  ],
  alternates: {
    canonical: `${BASE_URL}/companies`,
  },
  openGraph: {
    title: "Company Directory \u2014 Replace Me",
    description:
      "Explore global companies hiring Filipino remote professionals directly on Replace Me. No agency, no middlemen.",
    url: `${BASE_URL}/companies`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function PublicCompaniesPage() {
  const companies = await getPublicCompanyDirectory();
  return <PublicCompanyDirectory companies={companies} />;
}
