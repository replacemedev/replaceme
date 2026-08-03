"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Scale, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminCases,
  type AdminCaseRow,
} from "@/actions/admin/disputes";
import { DisputeRowActionsMenu } from "@/components/admin/disputes/DisputeRowActionsMenu";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  CASE_STAGE_LABELS,
  formatDisputedAmount,
  isFinancialCaseCategory,
  type AdminDisputesTab,
  type CaseStage,
} from "@/lib/reporting/constants";

const TABS: { id: AdminDisputesTab; label: string }[] = [
  { id: "financial", label: "Active Mediation (Financial)" },
  { id: "safety", label: "Safety & Policy" },
  { id: "resolved", label: "Resolved / Closed" },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StackedCell({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="truncate text-sm font-semibold text-slate-900">{primary}</p>
      {secondary ? (
        <p className="truncate text-xs text-slate-500">{secondary}</p>
      ) : null}
    </div>
  );
}

function stageLabel(stage: CaseStage) {
  return CASE_STAGE_LABELS[stage] ?? stage;
}

export function DisputesClient({
  initial,
  initialTab,
}: {
  initial: { items: AdminCaseRow[]; total: number };
  initialTab: AdminDisputesTab;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? initialTab;
  const activeTab = (
    ["financial", "safety", "resolved"].includes(tabParam)
      ? tabParam
      : "financial"
  ) as AdminDisputesTab;

  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [data, setData] = useState(initial);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const fetchCases = (tab: AdminDisputesTab, nextPage: number) => {
    startTransition(async () => {
      const next = await getAdminCases({
        tab,
        q: q.trim() || undefined,
        limit: itemsPerPage,
        offset: (nextPage - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load cases");
        return;
      }
      setData(next);
      setPage(nextPage);
    });
  };

  useEffect(() => {
    fetchCases(activeTab, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on tab change only
  }, [activeTab]);

  const openCase = (caseId: string) => {
    router.push(`/admin/disputes/${caseId}`);
  };

  const refresh = () => fetchCases(activeTab, page);

  const renderCards = (rows: AdminCaseRow[]) =>
    rows.map((row) => {
      const amount = formatDisputedAmount(
        row.disputedAmountCents,
        row.disputedCurrency
      );
      return (
        <AdminMobileCard
          key={row.caseId}
          actionsPlacement="header"
          actions={
            <DisputeRowActionsMenu
              caseId={row.caseId}
              sourceId={row.sourceId}
              isFinancial={isFinancialCaseCategory(row.violationCategory)}
              isLegacy={row.source === "legacy_dispute"}
              defendantUserId={row.defendantId}
              defendantLabel={row.defendantName}
              defendantEmail={row.defendantEmail || null}
              onReview={() => openCase(row.caseId)}
              onChanged={refresh}
            />
          }
        >
          <button
            type="button"
            className="w-full min-w-0 space-y-2.5 text-left"
            onClick={() => openCase(row.caseId)}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-500">
                {row.displayId}
              </span>
              <StatusBadge status={stageLabel(row.caseStage)} />
              {row.hasEvidence ? (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Paperclip className="h-3 w-3" aria-hidden />
                  Evidence
                </span>
              ) : null}
            </div>
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.title}
            </p>
            <p className="line-clamp-2 text-xs text-slate-500">{row.description}</p>
            <div className="grid min-w-0 gap-1.5 text-xs text-slate-600">
              <p className="min-w-0 truncate">
                <span className="font-medium text-slate-500">Plaintiff · </span>
                {row.plaintiffName}
              </p>
              <p className="min-w-0 truncate">
                <span className="font-medium text-slate-500">Defendant · </span>
                {row.defendantName}
              </p>
              {amount ? (
                <p className="font-semibold text-slate-800">{amount}</p>
              ) : null}
              <p className="text-slate-400">{formatWhen(row.createdAt)}</p>
            </div>
          </button>
        </AdminMobileCard>
      );
    });

  const renderTable = (rows: AdminCaseRow[]) => (
    <table className="w-full min-w-[900px] border-collapse text-left">
      <thead className={ADMIN_TABLE_HEAD}>
        <tr>
          <th className={ADMIN_TABLE_TH}>Case</th>
          <th className={ADMIN_TABLE_TH}>Parties</th>
          <th className={ADMIN_TABLE_TH}>Issue</th>
          <th className={ADMIN_TABLE_TH}>Amount</th>
          <th className={ADMIN_TABLE_TH}>Stage</th>
          <th className={ADMIN_TABLE_TH}>Filed</th>
          <th className={`${ADMIN_TABLE_TH} w-12`}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => {
          const amount = formatDisputedAmount(
            row.disputedAmountCents,
            row.disputedCurrency
          );
          return (
            <tr
              key={row.caseId}
              className={`${ADMIN_TABLE_ROW} cursor-pointer`}
              onClick={() => openCase(row.caseId)}
            >
              <td className={`${ADMIN_TABLE_TD} max-w-[9rem]`}>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-slate-700">
                    {row.displayId}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {row.violationLabel}
                    {row.hasEvidence ? " · Evidence" : ""}
                  </p>
                </div>
              </td>
              <td className={`${ADMIN_TABLE_TD} max-w-[12rem]`}>
                <StackedCell
                  primary={row.plaintiffName}
                  secondary={`vs ${row.defendantName}`}
                />
              </td>
              <td className={`${ADMIN_TABLE_TD} max-w-[16rem]`}>
                <StackedCell primary={row.title} secondary={row.description} />
              </td>
              <td className={ADMIN_TABLE_TD}>
                <span className="text-sm font-medium text-slate-700">
                  {amount ?? "—"}
                </span>
              </td>
              <td className={ADMIN_TABLE_TD}>
                <StatusBadge status={stageLabel(row.caseStage)} />
              </td>
              <td className={`${ADMIN_TABLE_TD} whitespace-nowrap text-xs text-slate-500`}>
                {formatWhen(row.createdAt)}
              </td>
              <td
                className={ADMIN_TABLE_TD}
                onClick={(e) => e.stopPropagation()}
              >
                <DisputeRowActionsMenu
                  caseId={row.caseId}
                  sourceId={row.sourceId}
                  isFinancial={isFinancialCaseCategory(row.violationCategory)}
                  isLegacy={row.source === "legacy_dispute"}
                  defendantUserId={row.defendantId}
                  defendantLabel={row.defendantName}
                  defendantEmail={row.defendantEmail || null}
                  onReview={() => openCase(row.caseId)}
                  onChanged={refresh}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4 min-w-0 w-full">
      <AdminTabs tabs={TABS} />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Unified Trust &amp; Safety case center. Financial outcomes are{" "}
          <span className="font-semibold text-slate-600">advisory only</span> —
          the platform does not hold engagement escrow.
        </p>
        <form
          className="relative w-full min-w-0 sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            fetchCases(activeTab, 1);
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cases…"
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Search cases"
          />
        </form>
      </div>

      {data.items.length === 0 && !pending ? (
        <EmptyState
          icon={<Scale className="h-5 w-5" aria-hidden />}
          title="No cases in this queue"
          description={
            activeTab === "financial"
              ? "Wage and payment concerns will appear here for non-binding review."
              : activeTab === "safety"
                ? "Harassment, fraud, and policy reports will appear here."
                : "Resolved and dismissed cases will appear here."
          }
        />
      ) : (
        <div className={pending ? "opacity-60 pointer-events-none" : undefined}>
          <AdminDataTable mobileCards={renderCards(data.items)}>
            {renderTable(data.items)}
          </AdminDataTable>
          <div className="mt-4">
            <TablePagination
              currentPage={page}
              pageSize={itemsPerPage}
              totalItems={data.total}
              onPageChange={(p) => fetchCases(activeTab, p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
