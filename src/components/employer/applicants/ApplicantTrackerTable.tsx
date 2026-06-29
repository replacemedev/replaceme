import Link from "next/link";
import type { ApplicationStatus } from "@/types/applications";
import { APPLICATION_STATUS_LABELS } from "@/types/applications";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";
import { EmployerInlineActions } from "@/components/employer/layout/EmployerInlineActions";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";

export type ApplicantTrackerRow = {
  id: string;
  candidateId: string;
  name: string;
  avatarUrl: string | null;
  matchScore: number;
  status: ApplicationStatus;
  appliedAt: string;
  isPreview: boolean;
  jobId: string;
};

type ApplicantTrackerTableProps = {
  rows: ApplicantTrackerRow[];
  planSlug: string;
  messagingEnabled: boolean;
};

export function ApplicantTrackerTable({
  rows,
  planSlug,
  messagingEnabled,
}: ApplicantTrackerTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        No applicants yet for this job.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-[min(70vh,640px)] overflow-y-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600 sticky top-0 z-10 shadow-[0_1px_0_0_rgb(226_232_240)]">
          <tr>
            <th className="px-4 py-3 font-semibold text-xs">Candidate</th>
            <th className="px-4 py-3 font-semibold text-xs">Match</th>
            <th className="px-4 py-3 font-semibold text-xs">Status</th>
            <th className="px-4 py-3 font-semibold text-xs">Applied</th>
            <th className="px-4 py-3 font-semibold text-xs text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-slate-100 hover:bg-slate-50/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {row.avatarUrl && !row.isPreview ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="relative h-9 w-9 rounded-full bg-slate-200 inline-flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400">
                        ?
                      </span>
                    </span>
                  )}
                  <div className="min-w-0">
                    <Link
                      href={`/employer/candidates/${row.candidateId}?jobId=${row.jobId}`}
                      className="font-semibold text-slate-900 hover:text-[#006e2f] hover:underline truncate block"
                    >
                      {row.name}
                    </Link>
                    {row.isPreview ? (
                      <UnlockOverlay
                        feature="identity"
                        currentPlan={planSlug}
                        compact
                      />
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">
                {row.matchScore}%
              </td>
              <td className="px-4 py-3">
                {row.isPreview ? (
                  <span className="text-slate-500 text-xs font-medium">
                    {APPLICATION_STATUS_LABELS[row.status]}
                  </span>
                ) : (
                  <ApplicationStatusDropdown
                    applicationId={row.id}
                    status={row.status}
                  />
                )}
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs font-medium whitespace-nowrap">
                {new Date(row.appliedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <EmployerInlineActions
                  planSlug={planSlug}
                  messagingEnabled={messagingEnabled}
                  profileHref={`/employer/candidates/${row.candidateId}?jobId=${row.jobId}`}
                  profileLabel={row.isPreview ? "Preview" : "Profile"}
                  jobId={row.jobId}
                  candidateId={row.candidateId}
                  className="justify-end"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
