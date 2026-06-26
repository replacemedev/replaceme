"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  submitEmployerReview,
  type ReviewableWorker,
} from "@/actions/employer/reviews";
import { EmptyState } from "@/components/shared/EmptyState";
import { Star } from "lucide-react";

export function ReviewsClient({ workers }: { workers: ReviewableWorker[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(
    workers.find((w) => !w.hasReview)?.workerId ?? null
  );
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const pending = workers.filter((w) => !w.hasReview);

  const submit = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const toastId = toast.loading("Submitting review...");
      const result = await submitEmployerReview({
        workerId: selectedId,
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

  if (workers.length === 0) {
    return (
      <EmptyState
        icon={<Star size={20} />}
        title="No hires to review yet"
        description="After you hire a worker, you can leave a testimonial here."
        actionLabel="View hired workers"
        actionHref="/employer/hired"
      />
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Leave a review</h2>
          <label className="block text-sm font-semibold text-slate-700">
            Worker
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {pending.map((w) => (
                <option key={w.workerId} value={w.workerId}>
                  {w.workerName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Rating (1–5)
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Review
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Share your experience working with this professional..."
            />
          </label>
          <button
            type="button"
            disabled={isPending || reviewText.length < 10}
            onClick={submit}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
          >
            Submit review
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">All hired workers have been reviewed.</p>
      )}

      <ul className="space-y-2">
        {workers.map((w) => (
          <li
            key={w.workerId}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
          >
            <span className="font-semibold text-slate-800">{w.workerName}</span>
            <span className="text-xs font-bold text-slate-500">
              {w.hasReview ? "Reviewed" : "Pending review"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
