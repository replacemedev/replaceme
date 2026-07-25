"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  FileWarning,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  approveJobPost,
  deleteJobPost,
  rejectJobPost,
  restoreJobPost,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  JOB_REJECTION_CATEGORY_HINTS,
  JOB_REJECTION_CATEGORY_LABELS,
  JOB_REJECTION_CATEGORY_VALUES,
  type JobRejectionCategory,
} from "@/types/admin.types";

export interface JobRowActionsMenuProps {
  jobId: string;
  title: string;
  status: string;
  rejectionCategory?: string | null;
  rejectionReason?: string | null;
  /** Called when parent should clear row selection after mutate. */
  onMutated?: () => void;
}

type DialogMode = "reject" | "delete" | "view_rejection" | null;
type MenuCoords = { top: number; left: number };

function categoryLabel(category: string | null | undefined): string {
  if (!category) return "Not recorded";
  if (category in JOB_REJECTION_CATEGORY_LABELS) {
    return JOB_REJECTION_CATEGORY_LABELS[category as JobRejectionCategory];
  }
  return category.replace(/_/g, " ");
}

export function JobRowActionsMenu({
  jobId,
  title,
  status,
  rejectionCategory = null,
  rejectionReason = null,
  onMutated,
}: JobRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] =
    useState<JobRejectionCategory>("tos_violation");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
    setCoords(null);
  };

  const resetDialog = () => {
    setMode(null);
    setCategory("tos_violation");
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
    const estimatedHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < estimatedHeight && rect.top > estimatedHeight
        ? rect.top - estimatedHeight - 4
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

  const isDeleted = status === "Deleted";
  const isRejected = status === "Rejected";
  const canApprove = status === "Pending Review";
  const canReject = status === "Pending Review" || status === "Active";
  const canDelete = !isDeleted;
  const canRestore = isDeleted;
  const canViewRejection = isRejected || Boolean(rejectionCategory);
  const detailHref = `/admin/jobs/${jobId}`;

  const runApprove = () => {
    startTransition(async () => {
      const result = await approveJobPost(jobId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job approved and published");
      closeMenu();
      onMutated?.();
      router.refresh();
    });
  };

  const runReject = () => {
    startTransition(async () => {
      const result = await rejectJobPost({
        jobId,
        category,
        reason: reason.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job rejected — employer notified");
      resetDialog();
      closeMenu();
      onMutated?.();
      router.refresh();
    });
  };

  const runDelete = () => {
    startTransition(async () => {
      const result = await deleteJobPost(
        jobId,
        reason.trim() || "Removed by admin"
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job soft-deleted");
      resetDialog();
      closeMenu();
      onMutated?.();
      router.refresh();
    });
  };

  const runRestore = () => {
    startTransition(async () => {
      const result = await restoreJobPost(jobId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job restored as Draft");
      closeMenu();
      onMutated?.();
      router.refresh();
    });
  };

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
      {canViewRejection ? (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-800 hover:bg-amber-50"
          onClick={() => {
            closeMenu();
            setMode("view_rejection");
          }}
        >
          <FileWarning className="h-3.5 w-3.5 shrink-0" aria-hidden />
          View rejection reason
        </button>
      ) : null}
      {canApprove ? (
        <button
          type="button"
          role="menuitem"
          disabled={pending}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          onClick={() => {
            closeMenu();
            runApprove();
          }}
        >
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Approve
        </button>
      ) : null}
      {canReject ? (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-800 hover:bg-amber-50"
          onClick={() => {
            closeMenu();
            setMode("reject");
          }}
        >
          <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Reject…
        </button>
      ) : null}
      {canRestore ? (
        <button
          type="button"
          role="menuitem"
          disabled={pending}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          onClick={() => {
            closeMenu();
            runRestore();
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Restore…
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
          onClick={() => {
            closeMenu();
            setMode("delete");
          }}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Delete…
        </button>
      ) : null}
    </>
  );

  const portalMenu =
    mounted && open && coords
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[200] w-52 max-w-[min(13rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {menuItems}
          </div>,
          document.body
        )
      : null;

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
          aria-label={`Actions for ${title}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </summary>
      </details>

      {portalMenu}

      <ConfirmDialog
        open={mode === "reject"}
        title="Reject job post?"
        description={`"${title}" will be rejected and hidden from workers. The employer will receive the reason by email and in-app notification.`}
        confirmLabel="Reject & notify"
        variant="danger"
        loading={pending}
        size="lg"
        onCancel={resetDialog}
        onConfirm={runReject}
      >
        <div className="space-y-4 text-left">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason category <span className="text-red-500">*</span>
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as JobRejectionCategory)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {JOB_REJECTION_CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {JOB_REJECTION_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 leading-relaxed">
              {JOB_REJECTION_CATEGORY_HINTS[category]}
            </p>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Additional explanation{" "}
              <span className="font-normal normal-case text-slate-400">
                (optional)
              </span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional detail for the employer and audit log…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={mode === "delete"}
        title="Delete job post?"
        description={`Soft-delete "${title}" so it leaves all public boards. You can restore it later from the Deleted filter.`}
        confirmLabel="Soft-delete"
        variant="danger"
        loading={pending}
        onCancel={resetDialog}
        onConfirm={runDelete}
      >
        <label className="block space-y-1.5 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reason (audit log)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why is this post being deleted?"
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={mode === "view_rejection"}
        title="Rejection reason"
        description={`Recorded moderation decision for "${title}".`}
        confirmLabel="Close"
        variant="default"
        loading={false}
        onCancel={resetDialog}
        onConfirm={resetDialog}
      >
        <div className="space-y-3 text-left text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {categoryLabel(rejectionCategory)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Explanation
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">
              {rejectionReason?.trim() || "No additional explanation recorded."}
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}
