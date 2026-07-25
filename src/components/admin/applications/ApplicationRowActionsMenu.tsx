"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Flag,
  MoreHorizontal,
  ScrollText,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  clearAdminApplicationFlag,
  moderateAdminApplication,
} from "@/actions/admin/applications";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ApplicationModerationStatus } from "@/types/admin.types";

export interface ApplicationRowActionsMenuProps {
  applicationId: string;
  workerLabel: string;
  moderationStatus: ApplicationModerationStatus;
}

type DialogMode = "flag" | "suspend" | "clear" | null;

export function ApplicationRowActionsMenu({
  applicationId,
  workerLabel,
  moderationStatus,
}: ApplicationRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
  const [reason, setReason] = useState("");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  const resetDialog = () => {
    setMode(null);
    setReason("");
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const runModerate = (next: "flagged" | "suspended") => {
    if (reason.trim().length < 8) {
      toast.error("Provide a reason (at least 8 characters).");
      return;
    }
    startTransition(async () => {
      const result = await moderateAdminApplication({
        applicationId,
        mode: next,
        reason: reason.trim(),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "suspended" ? "Application suspended" : "Application flagged"
      );
      resetDialog();
      router.refresh();
    });
  };

  const runClear = () => {
    startTransition(async () => {
      const result = await clearAdminApplicationFlag(applicationId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Moderation cleared");
      resetDialog();
      router.refresh();
    });
  };

  const detailHref = `/admin/applications/${applicationId}`;
  const auditHref = `/admin/applications/${applicationId}#audit-log`;

  return (
    <>
      <details
        ref={detailsRef}
        className="relative"
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary
          className="list-none cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors [&::-webkit-details-marker]:hidden"
          aria-label={`Actions for ${workerLabel}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </summary>
        <div className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            href={detailHref}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={closeMenu}
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            View details
          </Link>
          <Link
            href={auditHref}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={closeMenu}
          >
            <ScrollText className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            View audit log
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange-700 hover:bg-orange-50"
            onClick={() => {
              closeMenu();
              setMode("flag");
            }}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Flag application
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            onClick={() => {
              closeMenu();
              setMode("suspend");
            }}
          >
            <ShieldOff className="h-3.5 w-3.5" aria-hidden />
            Suspend application
          </button>
          {moderationStatus !== "clear" ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                closeMenu();
                setMode("clear");
              }}
            >
              Clear flag
            </button>
          ) : null}
        </div>
      </details>

      <ConfirmDialog
        open={mode === "flag" || mode === "suspend"}
        title={
          mode === "suspend" ? "Suspend application" : "Flag application"
        }
        description={
          mode === "suspend"
            ? `Hide ${workerLabel}'s application from the employer pipeline for Trust & Safety review.`
            : `Mark ${workerLabel}'s application for fraud or abuse review. The hiring status is unchanged.`
        }
        confirmLabel={mode === "suspend" ? "Suspend" : "Flag"}
        variant="danger"
        loading={pending}
        onCancel={resetDialog}
        onConfirm={() =>
          runModerate(mode === "suspend" ? "suspended" : "flagged")
        }
      >
        <label className="block space-y-1.5 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reason
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Describe the fraud, spam, or policy concern…"
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#22c55e]/30"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={mode === "clear"}
        title="Clear moderation flag"
        description={`Restore ${workerLabel}'s application to the normal hiring pipeline visibility.`}
        confirmLabel="Clear flag"
        loading={pending}
        onCancel={resetDialog}
        onConfirm={runClear}
      />
    </>
  );
}
