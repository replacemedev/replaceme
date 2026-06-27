"use client";

import { WorkerStickyActionBar } from "@/components/worker/layout/WorkerStickyActionBar";
import { ApplyActionButtons } from "./ApplyActionButtons";

interface JobDetailStickyActionsProps {
  jobId: string;
  isSaved: boolean;
  hasApplied: boolean;
}

export function JobDetailStickyActions({
  jobId,
  isSaved,
  hasApplied,
}: JobDetailStickyActionsProps) {
  return (
    <WorkerStickyActionBar>
      <ApplyActionButtons
        jobId={jobId}
        isSaved={isSaved}
        hasApplied={hasApplied}
        variant="bar"
      />
    </WorkerStickyActionBar>
  );
}
