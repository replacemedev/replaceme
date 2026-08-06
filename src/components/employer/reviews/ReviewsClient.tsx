"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  submitEmployerReview,
  type ReviewableWorker,
} from "@/actions/employer/reviews";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { EmptyState } from "@/components/shared/EmptyState";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { StarRatingInput } from "./StarRatingInput";
import { ReviewsToolbar, type ReviewStatusFilter } from "./ReviewsToolbar";
import { Star, CheckCircle2, SearchX } from "lucide-react";
import { useDebouncedUrlFilter } from "@/hooks/useDebouncedUrlFilter";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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

  const initials = getInitials(worker.workerName);

  if (worker.hasReview) {
    return (
      <li className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <AvatarImage
            src={worker.avatarUrl}
            alt={worker.workerName}
            initials={initials}
            size="sm"
            rounded="full"
            containerClassName="border border-slate-200/60 bg-slate-100 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 inline-flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
              <span className="truncate min-w-0">{worker.workerName}</span>
              <VerifiedBadge show={worker.isVerified} size="sm" />
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hired team member • Review completed
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebfdf2] border border-[#006e2f]/10 px-3.5 py-1.5 text-xs font-bold text-[#006e2f] shrink-0 self-start sm:self-center">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Reviewed
        </span>
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all space-y-5">
      <div className="flex items-start gap-3.5 min-w-0">
        <AvatarImage
          src={worker.avatarUrl}
          alt={worker.workerName}
          initials={initials}
          size="sm"
          rounded="full"
          containerClassName="border border-[#006e2f]/20 bg-emerald-50 shadow-xs shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold text-slate-900 inline-flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
            <span className="truncate min-w-0">{worker.workerName}</span>
            <VerifiedBadge show={worker.isVerified} size="sm" />
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Share your experience working together on your team
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">
          Your rating
        </label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={isPending}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Written review
        </span>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          disabled={isPending}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all disabled:opacity-50 min-h-[110px] resize-y"
          placeholder="What stood out about this professional's work ethic, communication, and performance?"
        />
      </label>

      <div className="flex items-center justify-between gap-4 pt-1">
        <span className="text-[11px] font-medium text-slate-400">
          {reviewText.length < 10
            ? `At least 10 characters required (${reviewText.length}/10)`
            : `${reviewText.length} characters`}
        </span>
        <button
          type="button"
          disabled={isPending || reviewText.length < 10}
          onClick={submit}
          className="rounded-xl bg-[#006e2f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#005c26] hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          Submit review
        </button>
      </div>
    </li>
  );
}

export function ReviewsClient({ workers }: { workers: ReviewableWorker[] }) {
  const {
    searchValue,
    handleSearchChange,
    getParam,
    setParam,
    resetAllFilters,
    searchParams,
  } = useDebouncedUrlFilter({ searchKey: "q", debounceMs: 300 });

  const statusFilter = getParam("status", "all") as ReviewStatusFilter;

  const hasActiveFilters =
    Boolean(searchParams.get("q")) || Boolean(searchParams.get("status"));

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Status filter
      if (statusFilter === "pending" && worker.hasReview) return false;
      if (statusFilter === "reviewed" && !worker.hasReview) return false;

      // Search query filter
      if (searchValue.trim()) {
        const query = searchValue.toLowerCase().trim();
        if (!worker.workerName.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [workers, statusFilter, searchValue]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <ReviewsToolbar
        searchQuery={searchValue}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => setParam("status", val)}
        totalCount={workers.length}
        filteredCount={filteredWorkers.length}
      />

      {/* Filtered List or Empty State */}
      {filteredWorkers.length > 0 ? (
        <ul className="space-y-4">
          {filteredWorkers.map((worker) => (
            <ReviewWorkerCard key={worker.workerId} worker={worker} />
          ))}
        </ul>
      ) : workers.length === 0 && !hasActiveFilters ? (
        <EmptyState
          icon={<Star size={22} />}
          title="No hires to review yet"
          description="Hire a candidate first, then leave a testimonial for your team members here."
          actionLabel="View hired workers"
          actionHref="/employer/hired"
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <SearchX size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No matching workers found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchValue.trim()
              ? `We couldn't find any hired team members matching "${searchValue}".`
              : "No workers match the selected review status filter."}
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all mt-2 cursor-pointer"
          >
            Reset search & filters
          </button>
        </div>
      )}
    </div>
  );
}
