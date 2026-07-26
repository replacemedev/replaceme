"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ImageIcon,
  Loader2,
  MessageSquare,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import {
  applyCaseOutcome,
  updateAdminCase,
  type AdminCaseDetail,
} from "@/actions/admin/disputes";
import { DisputeRowActionsMenu } from "@/components/admin/disputes/DisputeRowActionsMenu";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { OptimizedImage } from "@/components/shared/media/OptimizedImage";
import {
  CASE_STAGE_LABELS,
  CASE_STAGES,
  RESOLUTION_OUTCOME_LABELS,
  formatDisputedAmount,
  isFinancialCaseCategory,
  type CaseStage,
} from "@/lib/reporting/constants";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function DisputeCaseDetailClient({
  initial,
}: {
  initial: AdminCaseDetail;
}) {
  const router = useRouter();
  const [caseData, setCaseData] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initial.adminNotes ?? "");
  const [defendantResponse, setDefendantResponse] = useState(
    initial.defendantResponse ?? ""
  );
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const financial = isFinancialCaseCategory(caseData.violationCategory);
  const amount = formatDisputedAmount(
    caseData.disputedAmountCents,
    caseData.disputedCurrency
  );

  const refresh = () => router.refresh();

  const saveNotes = () => {
    startTransition(async () => {
      const result = await updateAdminCase({
        caseId: caseData.caseId,
        adminNotes: notes.trim(),
        defendantResponse: defendantResponse.trim(),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Case file updated");
      setCaseData((c) => ({
        ...c,
        adminNotes: notes.trim() || null,
        defendantResponse: defendantResponse.trim() || null,
      }));
      refresh();
    });
  };

  const setStage = (stage: CaseStage) => {
    startTransition(async () => {
      const result = await updateAdminCase({
        caseId: caseData.caseId,
        caseStage: stage,
        ...(caseData.source === "legacy_dispute"
          ? {
              legacyStatus:
                stage === "resolved"
                  ? "resolved"
                  : stage === "dismissed"
                    ? "closed"
                    : stage === "awaiting_evidence"
                      ? "open"
                      : "under_review",
            }
          : {}),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Stage updated");
      setCaseData((c) => ({ ...c, caseStage: stage }));
      refresh();
    });
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-700">
              {caseData.displayId}
            </span>
            <StatusBadge status={CASE_STAGE_LABELS[caseData.caseStage]} />
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {caseData.violationLabel}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl truncate">
            {caseData.title}
          </h1>
          <p className="text-xs text-slate-500">
            Filed {formatWhen(caseData.createdAt)}
            {caseData.resolutionOutcome
              ? ` · ${RESOLUTION_OUTCOME_LABELS[caseData.resolutionOutcome]}`
              : ""}
          </p>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DisputeRowActionsMenu
            caseId={caseData.caseId}
            sourceId={caseData.sourceId}
            isFinancial={financial}
            isLegacy={caseData.source === "legacy_dispute"}
            defendantUserId={caseData.defendantId}
            defendantLabel={caseData.defendantName}
            defendantEmail={caseData.defendantEmail || null}
            onReview={() => undefined}
            onChanged={refresh}
          />
        </div>
      </div>

      {financial ? (
        <div className="flex min-w-0 items-start gap-2 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" aria-hidden />
          <p className="min-w-0 leading-snug">
            Financial mediation is{" "}
            <strong className="font-semibold">non-binding</strong>. Outcomes are
            recorded for Trust &amp; Safety — the platform does not escrow or
            release engagement funds.
          </p>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Plaintiff complaint">
          <StackedParty
            label="Plaintiff (reporter)"
            name={caseData.plaintiffName}
            email={caseData.plaintiffEmail}
            role={caseData.plaintiffRole}
          />
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {caseData.description || "No description provided."}
          </p>
          {amount ? (
            <p className="mt-3 text-sm font-semibold text-slate-900">
              Disputed amount: {amount}
            </p>
          ) : null}
        </Panel>

        <Panel title="Defendant counter-claim">
          <StackedParty
            label="Defendant (reported)"
            name={caseData.defendantName}
            email={caseData.defendantEmail}
            role={caseData.defendantRole}
          />
          {caseData.source === "user_report" ? (
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Response / counter-claim
              <textarea
                value={defendantResponse}
                onChange={(e) => setDefendantResponse(e.target.value)}
                rows={5}
                className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
                placeholder="Record the defendant’s statement here…"
              />
            </label>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Legacy mediation row — counter-claim field not available.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel title="Evidence">
          {caseData.evidenceSignedUrl ? (
            <button
              type="button"
              className="group relative block w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              onClick={() => setEvidenceOpen(true)}
            >
              <div className="relative aspect-video w-full">
                <OptimizedImage
                  src={caseData.evidenceSignedUrl}
                  alt="Case evidence"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="absolute inset-x-0 bottom-0 bg-slate-900/60 px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                Expand preview
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
              <ImageIcon className="h-4 w-4 shrink-0" aria-hidden />
              No screenshot attached
            </div>
          )}
        </Panel>

        <Panel title="Related context">
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex min-w-0 items-start gap-2">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold text-slate-500">Related job</p>
                {caseData.jobId ? (
                  <Link
                    href={`/admin/jobs/${caseData.jobId}`}
                    className="truncate font-medium text-[#006e2f] hover:underline"
                  >
                    {caseData.jobTitle || caseData.jobId}
                  </Link>
                ) : (
                  <p className="text-slate-500">None linked</p>
                )}
              </div>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold text-slate-500">Chat logs</p>
                {caseData.threadId ? (
                  <Link
                    href={`/admin/moderation/${caseData.threadId}`}
                    className="font-medium text-[#006e2f] hover:underline"
                  >
                    Open conversation review
                  </Link>
                ) : (
                  <p className="text-slate-500">No thread linked</p>
                )}
              </div>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Admin workspace">
        <div className="space-y-4 min-w-0">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Case stage
            </p>
            <div className="flex min-w-0 flex-wrap gap-2">
              {CASE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  disabled={pending || caseData.caseStage === stage}
                  onClick={() => setStage(stage)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    caseData.caseStage === stage
                      ? "bg-[#006e2f] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  } disabled:opacity-50`}
                >
                  {CASE_STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Internal notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder="Investigation notes…"
            />
          </label>

          <div className="flex min-w-0 flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={saveNotes}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005a27] disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Save case file
            </button>
            {financial ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await applyCaseOutcome({
                      caseId: caseData.caseId,
                      outcome: "non_binding_recommendation",
                      adminNotes: notes.trim() || undefined,
                    });
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Non-binding resolution recorded");
                    refresh();
                  });
                }}
                className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
              >
                Issue non-binding resolution
              </button>
            ) : null}
          </div>
        </div>
      </Panel>

      {evidenceOpen && caseData.evidenceSignedUrl ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Evidence preview"
          onClick={() => setEvidenceOpen(false)}
        >
          <div
            className="relative max-h-[min(90vh,900px)] w-full max-w-3xl min-w-0 overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">Evidence</p>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                onClick={() => setEvidenceOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="relative max-h-[80vh] overflow-auto bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={caseData.evidenceSignedUrl}
                alt="Case evidence full size"
                className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StackedParty({
  label,
  name,
  email,
  role,
}: {
  label: string;
  name: string;
  email: string;
  role: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
      <p className="truncate text-xs text-slate-500">
        {[role, email].filter(Boolean).join(" · ") || "—"}
      </p>
    </div>
  );
}
