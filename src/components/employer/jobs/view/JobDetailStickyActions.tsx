"use client";

import Link from "next/link";
import { Users, Edit3 } from "lucide-react";
import { EmployerStickyActionBar } from "@/components/employer/layout";

interface JobDetailStickyActionsProps {
  jobId: string;
}

export function JobDetailStickyActions({ jobId }: JobDetailStickyActionsProps) {
  return (
    <EmployerStickyActionBar>
      <div className="flex items-center gap-2 w-full">
        <Link
          href={`/employer/jobs/${jobId}/applicants`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006e2f] hover:bg-[#005c26] px-4 py-2.5 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          <Users className="h-4 w-4" aria-hidden />
          Pipeline
        </Link>
        <Link
          href={`/employer/jobs/create?edit=${jobId}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          <Edit3 className="h-4 w-4" aria-hidden />
          Edit
        </Link>
      </div>
    </EmployerStickyActionBar>
  );
}
