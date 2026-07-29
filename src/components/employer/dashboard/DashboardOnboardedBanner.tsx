"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

interface DashboardOnboardedBannerProps {
  planUsage: EmployerPlanUsage | null;
}

export function DashboardOnboardedBanner({
  planUsage,
}: DashboardOnboardedBannerProps) {
  const searchParams = useSearchParams();
  const isOnboarded = searchParams.get("onboarded") === "1";
  const [dismissed, setDismissed] = useState(false);

  if (!isOnboarded || dismissed) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-[#ebfdf2] px-5 py-4 pr-12 sm:pr-14"
      role="status"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/80 bg-white/70 text-slate-500 hover:text-slate-800 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        aria-label="Dismiss welcome message"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <CheckCircle2
            className="h-5 w-5 text-[#006e2f] shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#006e2f]">
              Company profile complete — you&apos;re ready to hire
            </p>
            <p className="text-xs text-emerald-900/80 font-medium mt-1">
              Post your first job on Discovery (free), then upgrade when you need
              full profiles, messaging, and instant approval.
            </p>
          </div>
        </div>
        <div className="shrink-0 min-w-0">
          <PostJobCTA planUsage={planUsage} />
        </div>
      </div>
    </div>
  );
}
