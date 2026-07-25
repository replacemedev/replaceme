"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteUserAccount,
  getUserClosureBlockers,
  scheduleUserAccountDeletion,
  suspendUser,
  unsuspendUser,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  DATA_RETENTION_PERIODS,
  formatClosureDate,
  addCalendarDays,
} from "@/lib/data/legal";
import type { AccountClosureBlockers } from "@/lib/server/privacy/account-blockers";

type DurationDays = 7 | 14 | 30 | 90 | null;

type MarketplaceUserKind = "worker" | "employer";

export interface UserRowActionsMenuProps {
  userId: string;
  label: string;
  email: string | null;
  kind: MarketplaceUserKind;
  accountStatus: "active" | "suspended";
  deletedAt: string | null;
  profileHref: string;
}

type DialogMode = "suspend" | "unsuspend" | "delete" | null;

export function UserRowActionsMenu({
  userId,
  label,
  email,
  kind,
  accountStatus,
  deletedAt,
  profileHref,
}: UserRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const [reason, setReason] = useState("");
  const [reasonCategory, setReasonCategory] = useState<
    "policy" | "fraud" | "user_request" | "legal_hold" | "other"
  >("policy");
  const [durationDays, setDurationDays] = useState<DurationDays>(
    ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
  );
  const [notifyUser, setNotifyUser] = useState(true);
  const [deleteMode, setDeleteMode] = useState<"schedule" | "immediate">(
    "schedule"
  );
  const [forceClose, setForceClose] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [blockers, setBlockers] = useState<AccountClosureBlockers | null>(null);
  const [loadingBlockers, setLoadingBlockers] = useState(false);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  const resetForm = () => {
    setMode(null);
    setReason("");
    setReasonCategory("policy");
    setDurationDays(ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays);
    setNotifyUser(true);
    setDeleteMode("schedule");
    setForceClose(false);
    setConfirmText("");
    setBlockers(null);
  };

  useEffect(() => {
    if (mode !== "delete") return;
    let cancelled = false;
    setLoadingBlockers(true);
    void getUserClosureBlockers(userId)
      .then((data) => {
        if (!cancelled) setBlockers(data);
      })
      .catch(() => {
        if (!cancelled) setBlockers(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingBlockers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, userId]);

  if (deletedAt) {
    return (
      <span className="text-xs font-medium text-slate-400" title="Account erased">
        Erased
      </span>
    );
  }

  const runAction = () => {
    if (!mode) return;
    startTransition(async () => {
      if (mode === "unsuspend") {
        const result = await unsuspendUser(userId, notifyUser);
        if (result.success) {
          toast.success("User reactivated");
          resetForm();
          closeMenu();
          router.refresh();
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (mode === "suspend") {
        if (reason.trim().length < 3) {
          toast.error("Enter a reason (at least 3 characters)");
          return;
        }
        const result = await suspendUser({
          userId,
          reason: reason.trim(),
          durationDays,
          notifyUser,
          reasonCategory,
        });
        if (result.success) {
          toast.success("User suspended");
          resetForm();
          closeMenu();
          router.refresh();
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (mode === "delete") {
        if (reason.trim().length < 3) {
          toast.error("Enter a reason (at least 3 characters)");
          return;
        }
        const expected =
          confirmText.trim() === "DELETE" ||
          (email && confirmText.trim().toLowerCase() === email.toLowerCase());
        if (!expected) {
          toast.error('Type DELETE or the account email to confirm');
          return;
        }
        if (blockers && !blockers.canProceedWithoutForce && !forceClose) {
          toast.error("Resolve blockers or enable Force close");
          return;
        }

        const payload = {
          userId,
          reason: reason.trim(),
          reasonCategory,
          forceCloseEngagements: forceClose,
          notifyUser,
          confirmText: confirmText.trim(),
        };

        const result =
          deleteMode === "schedule"
            ? await scheduleUserAccountDeletion(payload)
            : await deleteUserAccount(payload);

        if (result.success) {
          toast.success(
            deleteMode === "schedule"
              ? "Deletion scheduled"
              : "Account erased"
          );
          resetForm();
          closeMenu();
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  const graceEnd = formatClosureDate(
    addCalendarDays(new Date(), ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays)
  );

  return (
    <>
      <details
        ref={detailsRef}
        className="relative inline-block text-left"
        onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          <span className="sr-only">Actions for {label}</span>
        </summary>
        {open ? (
          <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <Link
              href={profileHref}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={closeMenu}
            >
              <Eye className="h-4 w-4 text-slate-400" aria-hidden />
              View profile
            </Link>
            {accountStatus === "active" ? (
              <MenuButton
                icon={UserX}
                label="Suspend"
                onClick={() => {
                  closeMenu();
                  setMode("suspend");
                }}
              />
            ) : (
              <MenuButton
                icon={UserCheck}
                label="Unsuspend"
                onClick={() => {
                  closeMenu();
                  setMode("unsuspend");
                }}
              />
            )}
            <MenuButton
              icon={Trash2}
              label="Delete account"
              danger
              onClick={() => {
                closeMenu();
                setMode("delete");
              }}
            />
          </div>
        ) : null}
      </details>

      <ConfirmDialog
        open={mode !== null}
        title={
          mode === "suspend"
            ? `Suspend ${kind}?`
            : mode === "unsuspend"
              ? `Reactivate ${kind}?`
              : `Delete ${kind} account?`
        }
        description={
          mode === "suspend"
            ? `Ban ${label} from signing in. ${kind === "employer" ? "Active job posts will be closed." : "They will be hidden from discovery."}`
            : mode === "unsuspend"
              ? `Restore access for ${label}. Closed jobs are not auto-reopened.`
              : `Soft-delete and anonymize ${label}. Contracts and billing ledgers are retained.`
        }
        confirmLabel={
          mode === "suspend"
            ? "Suspend"
            : mode === "unsuspend"
              ? "Reactivate"
              : deleteMode === "schedule"
                ? "Schedule deletion"
                : "Erase now"
        }
        variant={mode === "unsuspend" ? "default" : "danger"}
        loading={pending}
        onCancel={resetForm}
        onConfirm={runAction}
      >
        {mode === "suspend" ? (
          <div className="space-y-3 text-sm">
            <Field label="Duration">
              <select
                value={durationDays === null ? "indefinite" : String(durationDays)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDurationDays(v === "indefinite" ? null : (Number(v) as DurationDays));
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {ACCOUNT_LIFECYCLE_TIMELINES.suspendOptionsDays.map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
                <option value="indefinite">Until further review</option>
              </select>
            </Field>
            <Field label="Reason category">
              <select
                value={reasonCategory}
                onChange={(e) =>
                  setReasonCategory(e.target.value as typeof reasonCategory)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="policy">Policy</option>
                <option value="fraud">Fraud</option>
                <option value="user_request">User request</option>
                <option value="legal_hold">Legal hold</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Reason (audit)">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Policy violation, fraud report, etc."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
          </div>
        ) : null}

        {mode === "unsuspend" ? (
          <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
        ) : null}

        {mode === "delete" ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Schedule uses a {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day
              grace (closes ~{graceEnd}). Immediate erase skips recovery.
            </div>
            <Field label="Mode">
              <select
                value={deleteMode}
                onChange={(e) =>
                  setDeleteMode(e.target.value as "schedule" | "immediate")
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="schedule">Schedule (default, 30-day grace)</option>
                <option value="immediate">Immediate erase (override)</option>
              </select>
            </Field>
            {loadingBlockers ? (
              <p className="text-xs text-slate-500">Checking engagements…</p>
            ) : blockers ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {blockers.canProceedWithoutForce ? (
                  <p>No open engagement blockers.</p>
                ) : (
                  <ul className="list-disc space-y-1 pl-4">
                    {blockers.messages.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            {!blockers?.canProceedWithoutForce ? (
              <label className="flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={forceClose}
                  onChange={(e) => setForceClose(e.target.checked)}
                  className="mt-0.5"
                />
                Force close engagements (audited)
              </label>
            ) : null}
            <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-800">Wiped</p>
                <ul className="mt-1 list-disc pl-4">
                  <li>Profile PII / email → sentinel</li>
                  <li>KYC / resume / avatar</li>
                  {kind === "employer" ? <li>Public company fields</li> : null}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Retained</p>
                <ul className="mt-1 list-disc pl-4">
                  {DATA_RETENTION_PERIODS.slice(2, 5).map((r) => (
                    <li key={r.category}>{r.category}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Field label="Reason category">
              <select
                value={reasonCategory}
                onChange={(e) =>
                  setReasonCategory(e.target.value as typeof reasonCategory)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="policy">Policy</option>
                <option value="fraud">Fraud</option>
                <option value="user_request">User request</option>
                <option value="legal_hold">Legal hold</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Reason (audit)">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label='Type DELETE or the account email'>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={email ?? "DELETE"}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function NotifyCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-xs text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      Notify user by email
    </label>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className={`h-4 w-4 ${danger ? "text-red-500" : "text-slate-400"}`} />
      {label}
    </button>
  );
}
