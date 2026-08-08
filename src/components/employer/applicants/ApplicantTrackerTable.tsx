"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ApplicationStatus } from "@/types/applications";
import { APPLICATION_STATUS_LABELS } from "@/types/applications";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";
import { EmployerInlineActions } from "@/components/employer/layout/EmployerInlineActions";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { AvatarImage } from "@/components/shared/media/AvatarImage";

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
  isVerified: boolean;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;

  const paginatedRows = useMemo(() => {
    return rows.slice(startIndex, startIndex + itemsPerPage);
  }, [rows, startIndex]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        No applicants yet for this job.
      </p>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        <table className="w-full min-w-[800px] table-fixed border-collapse text-sm text-left">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-[0_1px_0_0_rgb(226_232_240)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-xs">Candidate</th>
              <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">
                Match
              </th>
              <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">
                Applied
              </th>
              <th className="px-4 py-3 font-semibold text-xs text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-100 hover:bg-slate-50/50"
              >
                <td className="px-4 py-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarImage
                      src={
                        row.avatarUrl && !row.isPreview ? row.avatarUrl : null
                      }
                      alt=""
                      initials={row.isPreview ? "?" : row.name.slice(0, 2)}
                      size="xs"
                      containerClassName="h-9 w-9 min-h-9 min-w-9 bg-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/employer/candidates/${row.candidateId}?jobId=${row.jobId}`}
                        className="font-semibold text-slate-900 hover:text-[#006e2f] hover:underline inline-flex items-center gap-1.5 min-w-0 max-w-full"
                      >
                        <span className="truncate min-w-0">{row.name}</span>
                        {!row.isPreview ? (
                          <VerifiedBadge show={row.isVerified} size="sm" />
                        ) : null}
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
                <td className="px-4 py-3 font-semibold tabular-nums whitespace-nowrap">
                  {row.matchScore}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.isPreview ? (
                    <span className="text-slate-500 text-xs font-medium">
                      {APPLICATION_STATUS_LABELS[row.status]}
                    </span>
                  ) : (
                    <ApplicationStatusDropdown
                      applicationId={row.id}
                      status={row.status}
                      candidateName={row.name}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs font-medium whitespace-nowrap">
                  {new Date(row.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex justify-end">
                    <EmployerInlineActions
                      planSlug={planSlug}
                      messagingEnabled={messagingEnabled}
                      profileHref={`/employer/candidates/${row.candidateId}?jobId=${row.jobId}`}
                      profileLabel={row.isPreview ? "Preview" : "Profile"}
                      jobId={row.jobId}
                      candidateId={row.candidateId}
                      className="flex-nowrap justify-end"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={activePage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
