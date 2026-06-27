"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { isActiveJobLimitReached } from "@/lib/entitlements/limits";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";

interface PostJobNavLinkProps {
  planSlug: string;
  activeJobsCount: number;
  activeJobsLimit: number | null;
  className?: string;
  onNavigate?: () => void;
}

export function PostJobNavLink({
  planSlug,
  activeJobsCount,
  activeJobsLimit,
  className = "",
  onNavigate,
}: PostJobNavLinkProps) {
  const [gateOpen, setGateOpen] = useState(false);
  const atLimit = isActiveJobLimitReached(activeJobsCount, activeJobsLimit);

  if (!atLimit) {
    return (
      <Link
        href="/employer/jobs/create"
        onClick={onNavigate}
        className={className}
        role="menuitem"
      >
        Create a Job Post
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setGateOpen(true);
          onNavigate?.();
        }}
        className={className}
        role="menuitem"
      >
        Create a Job Post
      </button>
      {gateOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setGateOpen(false)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGateOpen(false)}
              className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm"
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
