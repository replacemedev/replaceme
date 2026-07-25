"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  Loader2,
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

type MenuCoords = { top: number; left: number };

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
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setCoords(null);
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
      const toastLifecycleSuccess = (
        message: string,
        result: { emailSent?: boolean; emailError?: string | null },
        wantedEmail: boolean
      ) => {
        if (wantedEmail && result.emailSent === false) {
          toast.success(message);
          toast.warning(
            result.emailError
              ? `Notification email failed: ${result.emailError}`
              : "Account updated, but the notification email did not send."
          );
          return;
        }
        toast.success(message);
      };

      if (mode === "unsuspend") {
        const result = await unsuspendUser(userId, notifyUser);
        if (result.success) {
          toastLifecycleSuccess(
            "User account successfully reactivated",
            result,
            notifyUser
          );
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
          toastLifecycleSuccess(
            "User account successfully suspended",
            result,
            notifyUser
          );
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
          toastLifecycleSuccess(
            deleteMode === "schedule"
              ? "Account deletion successfully scheduled"
              : "User account successfully erased",
            result,
            notifyUser
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

  const menuItems = (
    <>
      <Link
        href={profileHref}
        role="menuitem"
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
          aria-label={`Actions for ${label}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
          ) : (
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          )}
          <span className="sr-only">Actions for {label}</span>
        </summary>
      </details>

      {open && coords ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[80] w-52 max-w-[min(13rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {menuItems}
        </div>
      ) : null}

      <ConfirmDialog
        open={mode !== null}
        size={mode === "delete" ? "lg" : "md"}
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
          <div className="space-y-4 text-left text-sm">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-left leading-relaxed">
                Suspended accounts cannot sign in until reactivated
                {durationDays
                  ? ` or after the ${durationDays}-day period`
                  : " (or until further review)"}
                .
              </p>
            </div>
            <Field label="Duration">
              <select
                value={durationDays === null ? "indefinite" : String(durationDays)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDurationDays(v === "indefinite" ? null : (Number(v) as DurationDays));
                }}
                className={FIELD_CONTROL}
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
                className={FIELD_CONTROL}
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
                className={FIELD_CONTROL}
              />
            </Field>
            <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
          </div>
        ) : null}

        {mode === "unsuspend" ? (
          <div className="space-y-4 text-left text-sm">
            <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
          </div>
        ) : null}

        {mode === "delete" ? (
          <div className="space-y-5 text-left text-sm">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-950">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-left leading-relaxed">
                Schedule uses a{" "}
                {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day grace
                (closes ~{graceEnd}). Immediate erase skips recovery and cannot
                be undone from the admin panel.
              </p>
            </div>
            <Field label="Mode">
              <select
                value={deleteMode}
                onChange={(e) =>
                  setDeleteMode(e.target.value as "schedule" | "immediate")
                }
                className={FIELD_CONTROL}
              >
                <option value="schedule">Schedule (default, 30-day grace)</option>
                <option value="immediate">Immediate erase (override)</option>
              </select>
            </Field>
            {loadingBlockers ? (
              <p className="text-left text-sm text-slate-500">
                Checking engagements…
              </p>
            ) : blockers ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700">
                {blockers.canProceedWithoutForce ? (
                  <p className="text-left">No open engagement blockers.</p>
                ) : (
                  <ul className="ml-4 list-outside list-disc space-y-1.5 text-left">
                    {blockers.messages.map((m) => (
                      <li key={m} className="pl-1 text-left">
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            {!blockers?.canProceedWithoutForce ? (
              <label className="flex items-start gap-2.5 text-left text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={forceClose}
                  onChange={(e) => setForceClose(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                Force close engagements (audited)
              </label>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-left">
                <p className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Wiped
                </p>
                <ul className="mt-2 ml-4 list-outside list-disc space-y-1.5 text-left text-sm text-slate-700">
                  <li className="pl-0.5 text-left">
                    Profile PII / email → sentinel
                  </li>
                  <li className="pl-0.5 text-left">KYC / resume / avatar</li>
                  {kind === "employer" ? (
                    <li className="pl-0.5 text-left">Public company fields</li>
                  ) : null}
                </ul>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-left">
                <p className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Retained
                </p>
                <ul className="mt-2 ml-4 list-outside list-disc space-y-1.5 text-left text-sm text-slate-700">
                  {DATA_RETENTION_PERIODS.slice(2, 6).map((r) => (
                    <li key={r.category} className="pl-0.5 text-left">
                      {r.category}
                    </li>
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
                className={FIELD_CONTROL}
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
                className={FIELD_CONTROL}
              />
            </Field>
            <Field label="Type DELETE or the account email">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={email ?? "DELETE"}
                className={FIELD_CONTROL}
                autoComplete="off"
              />
            </Field>
            <NotifyCheckbox checked={notifyUser} onChange={setNotifyUser} />
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

const FIELD_CONTROL =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 md:text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block w-full text-left">
      <span className="block text-left text-sm font-medium text-slate-700">
        {label}
      </span>
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
    <label className="flex items-start gap-2.5 text-left text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300"
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
      role="menuitem"
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
