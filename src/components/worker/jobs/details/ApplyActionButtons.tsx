"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleSavedJob } from "@/actions/worker/job-search";

interface ApplyActionButtonsProps {
  jobId: string;
  isSaved: boolean;
  hasApplied: boolean;
}

export function ApplyActionButtons({
  jobId,
  isSaved: initialSaved,
  hasApplied: initialApplied,
}: ApplyActionButtonsProps) {
  const router = useRouter();
  const [isSaving, startSave] = useTransition();

  const handleSave = () => {
    startSave(async () => {
      const result = await toggleSavedJob(jobId);
      if (!result.success) {
        toast.error(result.error ?? "Could not update bookmark.");
        return;
      }
      toast.success(result.saved ? "Job saved." : "Job removed from saved list.");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
      {initialApplied ? (
        <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/20 text-white text-sm font-extrabold uppercase tracking-wide">
          Applied
        </span>
      ) : (
        <Link
          href={`/worker/jobs/${jobId}/apply`}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#4ade80] hover:bg-[#22c55e] text-[#0a4a29] text-sm font-extrabold uppercase tracking-wide shadow-[0_0_24px_rgba(74,222,128,0.45)] transition-colors text-center"
        >
          Apply for this job
        </Link>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark
            className={`h-4 w-4 ${initialSaved ? "fill-white" : ""}`}
            aria-hidden
          />
        )}
        Save
      </button>
    </div>
  );
}
