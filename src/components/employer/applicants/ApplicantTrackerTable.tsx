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
  isLocked: boolean;
};

type ApplicantTrackerTableProps = {
  rows: ApplicantTrackerRow[];
  onUnlock?: (candidateId: string) => void;
};

export function ApplicantTrackerTable({
  rows,
  onUnlock,
}: ApplicantTrackerTableProps) {
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
            <th className="px-4 py-3 font-medium">Actions</th>
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
                    <span className="h-9 w-9 rounded-full bg-slate-200 inline-block" />
                  )}
                  <span className="font-medium text-slate-900">{row.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{row.matchScore}%</td>
              <td className="px-4 py-3">
                {row.isLocked ? (
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
              <td className="px-4 py-3">
                {row.isLocked && onUnlock ? (
                  <button
                    type="button"
                    onClick={() => onUnlock(row.candidateId)}
                    className="text-primary font-medium hover:underline"
                  >
                    Unlock profile
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
