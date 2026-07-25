"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
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

type MenuCoords = { top: number; left: number };

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
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
    setCoords(null);
  };

  const resetDialog = () => {
    setMode(null);
    setReason("");
  };

  const placeMenu = () => {
    const el = summaryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 208;
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

  const runModerate = (next: "flagged" | "suspended") => {
    const trimmed = reason.trim();
    if (trimmed.length < 8) {
      toast.error("Provide a reason (at least 8 characters).");
      return;
    }
    startTransition(async () => {
      const result = await moderateAdminApplication({
        applicationId,
        mode: next,
        reason: trimmed,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "suspended"
          ? "Application successfully suspended"
          : "Application successfully flagged"
      );
      resetDialog();
      closeMenu();
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
      closeMenu();
      router.refresh();
    });
  };

  const detailHref = `/admin/applications/${applicationId}`;
  const auditHref = `/admin/applications/${applicationId}?section=audit`;

  const menuItems = (
    <>
      <Link
        href={detailHref}
        role="menuitem"
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        onClick={closeMenu}
      >
        <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        View details
      </Link>
      <Link
        href={auditHref}
        role="menuitem"
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        onClick={closeMenu}
      >
        <ScrollText
          className="h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden
        />
        View audit log
      </Link>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange-700 hover:bg-orange-50"
        onClick={() => {
          closeMenu();
          setMode("flag");
        }}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Flag application
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
        onClick={() => {
          closeMenu();
          setMode("suspend");
        }}
      >
        <ShieldOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Suspend application
      </button>
      {moderationStatus !== "clear" ? (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            closeMenu();
            setMode("clear");
          }}
        >
          Clear flag
        </button>
      ) : null}
    </>
  );

  return (
    <>
      <details
        ref={detailsRef}
        className="relative inline-block text-left"
        onToggle={(e) => {
          const nextOpen = (e.target as HTMLDetailsElement).open;
          setOpen(nextOpen);
          if (!nextOpen) setCoords(null);
        }}
      >
        <summary
          ref={summaryRef}
          className="list-none cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors [&::-webkit-details-marker]:hidden"
          aria-label={`Actions for ${workerLabel}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </summary>
      </details>

      {open && coords ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[80] w-52 max-w-[min(13rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {menuItems}
        </div>
      ) : null}

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
        onConfirm={() => {
          if (mode !== "flag" && mode !== "suspend") return;
          runModerate(mode === "suspend" ? "suspended" : "flagged");
        }}
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
