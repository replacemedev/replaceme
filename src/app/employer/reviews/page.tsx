import { getReviewableWorkers } from "@/actions/employer/reviews";
import { ReviewsClient } from "@/components/employer/reviews/ReviewsClient";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = { title: "Reviews | Replaceme" };
export const dynamic = "force-dynamic";

export default async function EmployerReviewsPage() {
  const workers = await getReviewableWorkers();

  return (
    <EmployerPageShell width="content">
      <EmployerPageHeader
        title="Worker reviews"
        subhead="Leave testimonials for workers you have hired on your team."
      />
      <ReviewsClient workers={workers} />
    </EmployerPageShell>
  );
}
