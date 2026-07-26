"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  FileText,
  HandCoins,
  Loader2,
  MoreHorizontal,
  Scale,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { suspendUser } from "@/actions/admin-actions";
import { applyCaseOutcome } from "@/actions/admin/disputes";
import { warnReportedUser } from "@/actions/reports";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ACCOUNT_LIFECYCLE_TIMELINES } from "@/lib/data/legal";
import type { ResolutionOutcome } from "@/lib/reporting/constants";

type DurationDays = 7 | 14 | 30 | 90 | null;
type DialogMode =
  | "warn"
  | "suspend"
  | "dismiss"
  | "outcome"
  | null;
type MenuCoords = { top: number; left: number };

export interface DisputeRowActionsMenuProps {
  caseId: string;
  sourceId: string;
  isFinancial: boolean;
  isLegacy: boolean;
  defendantUserId: string | null;
  defendantLabel: string;
  defendantEmail: string | null;
  onReview: () => void;
  onChanged: () => void;
}

export function DisputeRowActionsMenu({
  caseId,
  sourceId,
  isFinancial,
  isLegacy,
  defendantUserId,
  defendantLabel,
  defendantEmail,
  onReview,
  onChanged,
}: DisputeRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
  const [pendingOutcome, setPendingOutcome] =
    useState<ResolutionOutcome | null>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState<DurationDays>(
    ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
  );
  const [notes, setNotes] = useState("");

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
    setCoords(null);
  };

  const resetForm = () => {
    setMode(null);
    setPendingOutcome(null);
    setReason("");
    setNotes("");
    setDurationDays(
      ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
    );
  };

  const placeMenu = () => {
    const el = summaryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 260;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    const estimatedHeight = 320;
    const top =
      rect.bottom + 4 + estimatedHeight > window.innerHeight
        ? Math.max(8, rect.top - estimatedHeight - 4)
        : rect.bottom + 4;
    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        detailsRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };
    const onReposition = () => placeMenu();
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const openOutcome = (outcome: ResolutionOutcome) => {
    closeMenu();
    setPendingOutcome(outcome);
    setMode("outcome");
  };

  const runAction = () => {
    if (!mode) return;
    startTransition(async () => {
      if (mode === "dismiss") {
        if (notes.trim().length < 3) {
          toast.error("Add a short dismiss note");
          return;
        }
        const result = await applyCaseOutcome({
          caseId,
          outcome: "dismissed",
          adminNotes: notes.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Case dismissed");
        resetForm();
        onChanged();
        router.refresh();
        return;
      }

      if (mode === "outcome" && pendingOutcome) {
        const result = await applyCaseOutcome({
          caseId,
          outcome: pendingOutcome,
          adminNotes: notes.trim() || undefined,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Case outcome recorded (advisory — no funds moved)");
        resetForm();
        onChanged();
        router.refresh();
        return;
      }

      if (!defendantUserId || isLegacy) {
        toast.error("Safety actions require a reported user on a live case");
        return;
      }

      if (mode === "warn") {
        if (reason.trim().length < 10) {
          toast.error("Warning message must be at least 10 characters");
          return;
        }
        const result = await warnReportedUser({
          userId: defendantUserId,
          reportId: sourceId,
          reason: reason.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        await applyCaseOutcome({
          caseId,
          outcome: "policy_warn",
          adminNotes: reason.trim(),
        });
        toast.success("Warning sent (reporter identity kept confidential)");
        resetForm();
        onChanged();
        router.refresh();
        return;
      }

      if (mode === "suspend") {
        if (reason.trim().length < 3) {
          toast.error("Enter a suspension reason");
          return;
        }
        const result = await suspendUser({
          userId: defendantUserId,
          reason: reason.trim(),
          durationDays,
          notifyUser: true,
          reasonCategory: "policy",
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        await applyCaseOutcome({
          caseId,
          outcome: "policy_suspend",
          adminNotes: `Suspended: ${reason.trim()}`,
        });
        toast.success("Reported user suspended");
        resetForm();
        onChanged();
        router.refresh();
      }
    });
  };

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50";

  const menuItems = (
    <>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          closeMenu();
          onReview();
        }}
      >
        <Eye className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        Open case details
      </button>

      {isFinancial ? (
        <>
          <div className="my-1 border-t border-slate-100" />
          <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Financial (advisory)
          </p>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => openOutcome("funds_at_risk_noted")}
          >
            <HandCoins className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            Record funds-at-risk note
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => openOutcome("non_binding_recommendation")}
          >
            <Scale className="h-4 w-4 shrink-0 text-violet-500" aria-hidden />
            Issue non-binding resolution
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => openOutcome("favor_employer_recorded")}
          >
            <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            Record favor employer
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => openOutcome("favor_worker_recorded")}
          >
            <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            Record favor worker
          </button>
        </>
      ) : null}

      {!isLegacy && defendantUserId ? (
        <>
          <div className="my-1 border-t border-slate-100" />
          <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Safety
          </p>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              closeMenu();
              setMode("warn");
            }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            Issue warning
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            onClick={() => {
              closeMenu();
              setMode("suspend");
            }}
          >
            <UserX className="h-4 w-4 shrink-0" aria-hidden />
            Suspend account
          </button>
        </>
      ) : null}

      <div className="my-1 border-t border-slate-100" />
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          closeMenu();
          setMode("dismiss");
        }}
      >
        <XCircle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        Dismiss case
      </button>
    </>
  );

  const outcomeTitle =
    pendingOutcome === "funds_at_risk_noted"
      ? "Record funds-at-risk note"
      : pendingOutcome === "non_binding_recommendation"
        ? "Issue non-binding resolution"
        : pendingOutcome === "favor_employer_recorded"
          ? "Record favor employer"
          : pendingOutcome === "favor_worker_recorded"
            ? "Record favor worker"
            : "Record outcome";

  return (
    <>
      <details
        ref={detailsRef}
        className="relative inline-block text-left"
        onToggle={(event) => {
          const nextOpen = (event.target as HTMLDetailsElement).open;
          setOpen(nextOpen);
          if (!nextOpen) setCoords(null);
        }}
      >
        <summary
          ref={summaryRef}
          className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
          aria-label={`Actions for case ${defendantLabel}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => e.stopPropagation()}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
          ) : (
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          )}
        </summary>
      </details>

      {open && coords ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[90] max-h-[min(24rem,calc(100vh-1rem))] w-[260px] max-w-[min(16.25rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems}
        </div>
      ) : null}

      <ConfirmDialog
        open={mode === "warn" || mode === "suspend" || mode === "dismiss" || mode === "outcome"}
        size="md"
        title={
          mode === "warn"
            ? "Send warning"
            : mode === "suspend"
              ? "Suspend account"
              : mode === "dismiss"
                ? "Dismiss case"
                : outcomeTitle
        }
        description={
          mode === "warn"
            ? `Warn ${defendantLabel}${defendantEmail ? ` (${defendantEmail})` : ""}. Reporter identity stays confidential.`
            : mode === "suspend"
              ? `Suspend ${defendantLabel}. Reporter identity stays confidential.`
              : mode === "outcome"
                ? "This records an advisory outcome only. Replaceme does not hold or move engagement funds."
                : "Dismiss this case with an internal note."
        }
        confirmLabel={
          mode === "warn"
            ? "Send warning"
            : mode === "suspend"
              ? "Suspend user"
              : mode === "outcome"
                ? "Record outcome"
                : "Dismiss"
        }
        variant={mode === "suspend" ? "danger" : "default"}
        loading={pending}
        onCancel={resetForm}
        onConfirm={runAction}
      >
        {mode === "dismiss" || mode === "outcome" ? (
          <label className="block text-sm font-semibold text-slate-700">
            Internal notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder={
                mode === "outcome"
                  ? "Optional note for the case file…"
                  : "Why is this being dismissed?"
              }
            />
          </label>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              {mode === "warn" ? "Warning message (sent to user)" : "Reason"}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
                placeholder={
                  mode === "warn"
                    ? "Describe the policy concern without naming the reporter…"
                    : "Suspension reason…"
                }
              />
            </label>
            {mode === "suspend" ? (
              <label className="block text-sm font-semibold text-slate-700">
                Duration
                <select
                  value={durationDays === null ? "indefinite" : String(durationDays)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDurationDays(
                      v === "indefinite" ? null : (Number(v) as DurationDays)
                    );
                  }}
                  className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="indefinite">Until further review</option>
                </select>
              </label>
            ) : null}
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
