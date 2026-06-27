"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";

export function WorkerDashboardOnboardedBanner() {
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
            Profile setup complete — you&apos;re ready to apply
          </p>
          <p className="text-xs text-emerald-900/80 font-medium mt-1">
            Browse open roles, tailor your applications, and respond quickly when
            employers reach out.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/worker/jobs"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          Browse jobs
        </Link>
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
