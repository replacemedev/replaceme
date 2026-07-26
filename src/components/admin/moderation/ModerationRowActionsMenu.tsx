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
  Eye,
  Loader2,
  MoreHorizontal,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { suspendUser } from "@/actions/admin-actions";
import { dismissModerationFlag } from "@/actions/admin/messaging-moderation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ACCOUNT_LIFECYCLE_TIMELINES } from "@/lib/data/legal";

type DurationDays = 7 | 14 | 30 | 90 | null;
type DialogMode = "dismiss" | "suspend_worker" | "suspend_employer" | null;
type MenuCoords = { top: number; left: number };

export interface ModerationRowActionsMenuProps {
  flagId: string;
  threadId: string;
  workerId: string;
  workerLabel: string;
  employerUserId: string | null;
  employerLabel: string;
}

export function ModerationRowActionsMenu({
  flagId,
  threadId,
  workerId,
  workerLabel,
  employerUserId,
  employerLabel,
}: ModerationRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [durationDays, setDurationDays] = useState<DurationDays>(
    ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
  );

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
    if (!mode) return;
    startTransition(async () => {
      if (mode === "dismiss") {
        if (notes.trim().length < 3) {
          toast.error("Add a short dismiss note");
          return;
        }
        const result = await dismissModerationFlag({
          flagId,
          notes: notes.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Flag dismissed");
        resetForm();
        router.refresh();
        return;
      }

      const userId =
        mode === "suspend_worker" ? workerId : employerUserId;
      const label =
        mode === "suspend_worker" ? workerLabel : employerLabel;

      if (!userId) {
        toast.error("Could not resolve account to suspend");
        return;
      }
      if (reason.trim().length < 3) {
        toast.error("Enter a suspension reason");
        return;
      }

      const result = await suspendUser({
        userId,
        reason: reason.trim(),
        durationDays,
        notifyUser: true,
        reasonCategory: "policy",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${label} suspended`);
      resetForm();
      router.refresh();
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
          router.push(`/admin/moderation/${threadId}?flag=${flagId}`);
        }}
      >
        <Eye className="h-4 w-4 text-slate-400" aria-hidden />
        Review Thread
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
        Dismiss Flag
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-700 hover:bg-red-50"
        onClick={() => {
          closeMenu();
          setMode("suspend_worker");
        }}
      >
        <UserX className="h-4 w-4" aria-hidden />
        Suspend Worker
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!employerUserId}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent"
        onClick={() => {
          closeMenu();
          setMode("suspend_employer");
        }}
      >
        <UserX className="h-4 w-4" aria-hidden />
        Suspend Employer
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
          aria-label={`Actions for ${workerLabel} thread`}
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
        open={mode !== null}
        size="md"
        title={
          mode === "dismiss"
            ? "Dismiss flag"
            : mode === "suspend_worker"
              ? "Suspend worker"
              : "Suspend employer"
        }
        description={
          mode === "dismiss"
            ? "Dismiss this moderation case with an internal note. The thread will leave the active queue."
            : mode === "suspend_worker"
              ? `Suspend ${workerLabel}. Reporter identity stays confidential.`
              : `Suspend ${employerLabel}. Reporter identity stays confidential.`
        }
        confirmLabel={mode === "dismiss" ? "Dismiss" : "Suspend"}
        variant={mode === "dismiss" ? "default" : "danger"}
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
              Reason
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
                placeholder="Suspension reason…"
              />
            </label>
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
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
