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
  variant?: "hero" | "bar";
}

export function ApplyActionButtons({
  jobId,
  isSaved: initialSaved,
  hasApplied: initialApplied,
  variant = "hero",
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

  const isBar = variant === "bar";

  return (
    <div
      className={
        isBar
          ? "flex items-center gap-2 w-full"
          : "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0"
      }
    >
      {initialApplied ? (
        <span
          className={
            isBar
              ? "inline-flex flex-1 items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold"
              : "inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/20 text-white text-sm font-extrabold uppercase tracking-wide"
          }
        >
          Applied
        </span>
      ) : (
        <Link
          href={`/worker/jobs/${jobId}/apply`}
          className={
            isBar
              ? "inline-flex flex-1 items-center justify-center px-4 py-2.5 rounded-xl bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-bold transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
              : "inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#4ade80] hover:bg-[#22c55e] text-[#0a4a29] text-sm font-extrabold uppercase tracking-wide transition-colors text-center"
          }
        >
          Apply for this job
        </Link>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className={
          isBar
            ? "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
            : "inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
        }
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark
            className={`h-4 w-4 ${initialSaved ? (isBar ? "fill-[#006e2f] text-[#006e2f]" : "fill-white") : ""}`}
            aria-hidden
          />
        )}
        Save
      </button>
    </div>
  );
}
