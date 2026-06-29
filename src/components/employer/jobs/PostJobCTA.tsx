"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { isActiveJobLimitReached } from "@/lib/entitlements/limits";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";

interface PostJobCTAProps {
  planUsage: EmployerPlanUsage | null;
  className?: string;
  label?: string;
  compact?: boolean;
}

const BASE_CLASSES =
  "inline-flex w-full sm:w-auto items-center justify-center gap-2 transition-all duration-150 shadow-xs select-none shrink-0";

export function PostJobCTA({
  planUsage,
  className = "",
  label = "Post a New Job",
  compact = false,
}: PostJobCTAProps) {
  const sizeClasses = compact
    ? "px-5 py-2.5 text-sm font-semibold rounded-lg"
    : "px-5 py-3 text-sm font-bold rounded-xl";
  const [gateOpen, setGateOpen] = useState(false);
  const atLimit =
    planUsage !== null &&
    isActiveJobLimitReached(
      planUsage.activeJobsCount,
      planUsage.activeJobsLimit
    );

  if (!atLimit) {
    return (
      <Link
        href="/employer/jobs/create"
        className={`${BASE_CLASSES} ${sizeClasses} text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] hover:shadow-md cursor-pointer ${className}`}
      >
        <Plus size={18} aria-hidden />
        {label}
      </Link>
    );
  }

  const planSlug = planUsage?.planSlug ?? "discovery";

  return (
    <>
      <button
        type="button"
        onClick={() => setGateOpen(true)}
        className={`${BASE_CLASSES} ${sizeClasses} text-slate-500 bg-slate-100 border border-slate-200 cursor-pointer hover:bg-slate-50 ${className}`}
        aria-haspopup="dialog"
        aria-expanded={gateOpen}
      >
        <Plus size={18} aria-hidden />
        {label}
      </button>

      {gateOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Job limit reached"
          onClick={() => setGateOpen(false)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGateOpen(false)}
              className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <UnlockOverlay feature="job_limit" currentPlan={planSlug} />
          </div>
        </div>
      ) : null}
    </>
  );
}
