"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertTriangle,
  Eye,
  Loader2,
  MoreHorizontal,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { suspendUser } from "@/actions/admin-actions";
import {
  updateUserReportStatus,
  warnReportedUser,
} from "@/actions/reports";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ACCOUNT_LIFECYCLE_TIMELINES } from "@/lib/data/legal";

type DurationDays = 7 | 14 | 30 | 90 | null;
type DialogMode = "review" | "suspend" | "warn" | "dismiss" | null;
type MenuCoords = { top: number; left: number };

export interface ReportRowActionsMenuProps {
  reportId: string;
  reportedUserId: string;
  reportedLabel: string;
  reportedEmail: string | null;
  onReview: () => void;
  onChanged: () => void;
}

export function ReportRowActionsMenu({
  reportId,
  reportedUserId,
  reportedLabel,
  reportedEmail,
  onReview,
  onChanged,
}: ReportRowActionsMenuProps) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
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
    const menuWidth = 220;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    setCoords({ top: rect.bottom + 4, left });
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

  const runAction = () => {
    if (!mode || mode === "review") return;
    startTransition(async () => {
      if (mode === "dismiss") {
        if (notes.trim().length < 3) {
          toast.error("Add a short dismiss note");
          return;
        }
        const result = await updateUserReportStatus({
          reportId,
          status: "dismissed",
          adminNotes: notes.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Report dismissed");
        resetForm();
        onChanged();
        return;
      }

      if (mode === "warn") {
        if (reason.trim().length < 10) {
          toast.error("Warning message must be at least 10 characters");
          return;
        }
        const result = await warnReportedUser({
          userId: reportedUserId,
          reportId,
          reason: reason.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Warning sent (reporter identity kept confidential)");
        resetForm();
        onChanged();
        return;
      }

      if (mode === "suspend") {
        if (reason.trim().length < 3) {
          toast.error("Enter a suspension reason");
          return;
        }
        const result = await suspendUser({
          userId: reportedUserId,
          reason: reason.trim(),
          durationDays,
          notifyUser: true,
          reasonCategory: "policy",
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        await updateUserReportStatus({
          reportId,
          status: "investigating",
          adminNotes: `Suspended reported user: ${reason.trim()}`,
        });
        toast.success("Reported user suspended");
        resetForm();
        onChanged();
      }
    });
  };

  const menuItems = (
    <>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        onClick={() => {
          closeMenu();
          onReview();
        }}
      >
        <Eye className="h-4 w-4 text-slate-400" aria-hidden />
        Review case details
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        onClick={() => {
          closeMenu();
          setMode("warn");
        }}
      >
        <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
        Send warning
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
        <UserX className="h-4 w-4" aria-hidden />
        Suspend reported user
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        onClick={() => {
          closeMenu();
          setMode("dismiss");
        }}
      >
        <XCircle className="h-4 w-4 text-slate-400" aria-hidden />
        Dismiss report
      </button>
    </>
  );

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
          aria-label={`Actions for report on ${reportedLabel}`}
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
          className="fixed z-[80] w-[220px] max-w-[min(13.75rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems}
        </div>
      ) : null}

      <ConfirmDialog
        open={mode === "warn" || mode === "suspend" || mode === "dismiss"}
        size="md"
        title={
          mode === "warn"
            ? "Send warning"
            : mode === "suspend"
              ? "Suspend reported user"
              : "Dismiss report"
        }
        description={
          mode === "warn"
            ? `Warn ${reportedLabel}${reportedEmail ? ` (${reportedEmail})` : ""}. The reporter’s identity will not be disclosed.`
            : mode === "suspend"
              ? `Suspend ${reportedLabel}. The reporter’s identity stays confidential.`
              : "Dismiss this case with an internal note."
        }
        confirmLabel={
          mode === "warn"
            ? "Send warning"
            : mode === "suspend"
              ? "Suspend user"
              : "Dismiss"
        }
        variant={mode === "suspend" ? "danger" : "default"}
        loading={pending}
        onCancel={resetForm}
        onConfirm={runAction}
      >
        {mode === "dismiss" ? (
          <label className="block text-sm font-semibold text-slate-700">
            Internal notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder="Why is this being dismissed?"
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
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
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
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
