"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  submitEmployerReview,
  type ReviewableWorker,
} from "@/actions/employer/reviews";
import { EmptyState } from "@/components/shared/EmptyState";
import { StarRatingInput } from "./StarRatingInput";
import { Star, CheckCircle2 } from "lucide-react";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

function ReviewWorkerCard({ worker }: { worker: ReviewableWorker }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const submit = () => {
    startTransition(async () => {
      const toastId = toast.loading("Submitting review...");
      const result = await submitEmployerReview({
        workerId: worker.workerId,
        rating,
        reviewText,
      });
      if (result.success) {
        toast.success("Review submitted", { id: toastId });
        setReviewText("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed", { id: toastId });
      }
    });
  };

  if (worker.hasReview) {
    return (
      <li className={`${EMPLOYER_CARD} flex items-center justify-between gap-4 p-5`}>
        <div>
          <p className="text-sm font-extrabold text-slate-900">{worker.workerName}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Hired team member
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebfdf2] px-3 py-1 text-[11px] font-bold text-[#006e2f]">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Reviewed
        </span>
      </li>
    );
  }

  return (
    <li className={`${EMPLOYER_CARD} p-5 space-y-4`}>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{worker.workerName}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Share your experience working together
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-600">Your rating</p>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={isPending}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-bold text-slate-600">Review</span>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          disabled={isPending}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 disabled:opacity-50"
          placeholder="What stood out about this professional on your team?"
        />
      </label>

      <button
        type="button"
        disabled={isPending || reviewText.length < 10}
        onClick={submit}
        className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-50 transition-colors"
      >
        Submit review
      </button>
    </li>
  );
}

export function ReviewsClient({ workers }: { workers: ReviewableWorker[] }) {
  const pending = workers.filter((w) => !w.hasReview);

  if (workers.length === 0) {
    return (
      <EmptyState
        icon={<Star size={22} />}
        title="No hires to review yet"
        description="Hire a candidate first, then leave a testimonial for your team members here."
        actionLabel="View hired workers"
        actionHref="/employer/hired"
      />
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 ? (
        <p className="text-xs font-bold text-slate-500">
          {pending.length} review{pending.length === 1 ? "" : "s"} pending
        </p>
      ) : (
        <p className="text-sm font-medium text-slate-500">
          All hired workers have been reviewed. Thank you for your feedback.
        </p>
      )}

      <ul className="space-y-4">
        {workers.map((worker) => (
          <ReviewWorkerCard key={worker.workerId} worker={worker} />
        ))}
      </ul>
    </div>
  );
}
