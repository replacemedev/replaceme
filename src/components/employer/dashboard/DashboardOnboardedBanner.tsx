"use client";

import Link from "next/link";
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
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-emerald-200 bg-[#ebfdf2] px-5 py-4"
      role="status"
    >
      <div className="flex items-start gap-3 min-w-0">
        <CheckCircle2 className="h-5 w-5 text-[#006e2f] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#006e2f]">
            Company profile complete — you&apos;re ready to hire
          </p>
          <p className="text-xs text-emerald-900/80 font-medium mt-1">
            Post your first job on Discovery (free), then upgrade when you need
            full profiles, messaging, and instant approval.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PostJobCTA planUsage={planUsage} />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/80 bg-white/60 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Dismiss welcome message"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
