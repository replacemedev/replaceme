import Link from "next/link";
import type { ApplicationStatus } from "@/types/applications";
import { APPLICATION_STATUS_LABELS } from "@/types/applications";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";

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
};

export function ApplicantTrackerTable({ rows }: ApplicantTrackerTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        No applicants yet for this job.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Match</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Applied</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {row.avatarUrl ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="relative h-9 w-9 rounded-full bg-slate-200 inline-flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400">?</span>
                    </span>
                  )}
                  <Link
                    href={`/employer/candidates/${row.candidateId}?jobId=${row.jobId}`}
                    className="font-medium text-slate-900 hover:text-[#006e2f] hover:underline"
                  >
                    {row.name}
                  </Link>
                  {row.isPreview ? (
                    <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Preview
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3">{row.matchScore}%</td>
              <td className="px-4 py-3">
                {row.isPreview ? (
                  <span className="text-slate-500">
                    {APPLICATION_STATUS_LABELS[row.status]}
                  </span>
                ) : (
                  <ApplicationStatusDropdown
                    applicationId={row.id}
                    status={row.status}
                  />
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(row.appliedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
