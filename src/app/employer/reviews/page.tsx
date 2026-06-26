import { getReviewableWorkers } from "@/actions/employer/reviews";
import { ReviewsClient } from "@/components/employer/reviews/ReviewsClient";

export const metadata = { title: "Reviews | ReplaceMe" };
export const dynamic = "force-dynamic";

export default async function EmployerReviewsPage() {
  const workers = await getReviewableWorkers();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Worker reviews</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Leave testimonials for workers you have hired.
      </p>
      <ReviewsClient workers={workers} />
    </div>
  );
}
