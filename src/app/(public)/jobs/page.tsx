import { getPublicJobListings } from "@/actions/public/growth";
import { PublicJobBoardClient } from "@/components/public/PublicJobBoardClient";

export const metadata = {
  title: "Browse Jobs | ReplaceMe",
  description: "Public job board — explore active remote roles.",
};

export const dynamic = "force-dynamic";

export default async function PublicJobsPage() {
  const jobs = await getPublicJobListings();
  return <PublicJobBoardClient jobs={jobs} />;
}
