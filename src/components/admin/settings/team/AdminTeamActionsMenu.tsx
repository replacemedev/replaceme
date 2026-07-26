"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IdCard,
  KeyRound,
  Mail,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
  resendAdminInvite,
  revokeAdminInvite,
  triggerAdminPasswordReset,
  updateAdminStatus,
} from "@/actions/admin/team";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AdminSelfPasswordActions } from "@/components/admin/settings/AdminSelfPasswordActions";
import { isInvitePending } from "@/lib/admin/invite-status";
import type { AdminTeamRow } from "@/types/admin.types";
import { formatFullName } from "@/lib/format/name";

interface AdminTeamActionsMenuProps {
  member: AdminTeamRow;
  currentUserId: string;
  /** When true, show PII deep-dive (super admin only). */
  canViewPersonalDetails?: boolean;
  onEditAccess: () => void;
  onViewPersonalDetails?: () => void;
}

type PendingAction =
  | { type: "suspend"; userId: string; label: string }
  | { type: "unsuspend"; userId: string; label: string }
  | { type: "reset"; userId: string; label: string }
  | { type: "resend"; userId: string; label: string }
  | { type: "revoke"; userId: string; label: string };

export function AdminTeamActionsMenu({
  member,
  currentUserId,
  canViewPersonalDetails = false,
  onEditAccess,
  onViewPersonalDetails,
}: AdminTeamActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<PendingAction | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const isSelf = member.id === currentUserId;
  const pendingInvite = isInvitePending(member);
  const displayLabel =
    formatFullName(member.first_name, member.middle_name, member.last_name).trim() ||
    member.email ||
    "this admin";

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  const runAction = (action: PendingAction) => {
    startTransition(async () => {
      let result: { success: boolean; error?: string };

      switch (action.type) {
        case "suspend":
          result = await updateAdminStatus({
            userId: action.userId,
            status: "suspended",
            reason: "Suspended by super admin",
          });
          break;
        case "unsuspend":
          result = await updateAdminStatus({
            userId: action.userId,
            status: "active",
          });
          break;
        case "reset":
          result = await triggerAdminPasswordReset({ userId: action.userId });
          break;
        case "resend":
          result = await resendAdminInvite({ userId: action.userId });
          break;
        case "revoke":
          result = await revokeAdminInvite({ userId: action.userId });
          break;
        default:
          result = { success: false, error: "Unknown action" };
      }

      if (result.success) {
        toast.success(
          action.type === "resend"
            ? "Invite resent"
            : action.type === "revoke"
              ? "Invite revoked"
              : "Admin account updated"
        );
        setConfirm(null);
        closeMenu();
        router.refresh();
      } else {
        toast.error(result.error ?? "Action failed");
      }
    });
  };

  if (isSelf) {
    return <AdminSelfPasswordActions />;
  }

  return (
    <>
      <details
        ref={detailsRef}
        className="relative"
        onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      >
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          <span className="sr-only">Actions for {displayLabel}</span>
        </summary>
        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-56 max-w-[min(14rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            {canViewPersonalDetails && onViewPersonalDetails ? (
              <MenuButton
                icon={IdCard}
                label="View personal details"
                onClick={() => {
                  closeMenu();
                  onViewPersonalDetails();
                }}
              />
            ) : null}
            <MenuButton
              icon={Shield}
              label="Edit access"
              onClick={() => {
                closeMenu();
                onEditAccess();
              }}
            />
            {member.account_status === "active" ? (
              <MenuButton
                icon={UserX}
                label="Suspend"
                onClick={() =>
                  setConfirm({
                    type: "suspend",
                    userId: member.id,
                    label: displayLabel,
                  })
                }
              />
            ) : (
              <MenuButton
                icon={UserCheck}
                label="Activate"
                onClick={() =>
                  setConfirm({
                    type: "unsuspend",
                    userId: member.id,
                    label: displayLabel,
                  })
                }
              />
            )}
            {pendingInvite ? (
              <MenuButton
                icon={Mail}
                label="Resend invite"
                onClick={() =>
                  setConfirm({
                    type: "resend",
                    userId: member.id,
                    label: displayLabel,
                  })
                }
              />
            ) : (
              <MenuButton
                icon={KeyRound}
                label="Send password reset"
                onClick={() =>
                  setConfirm({
                    type: "reset",
                    userId: member.id,
                    label: displayLabel,
                  })
                }
              />
            )}
            {pendingInvite ? (
              <MenuButton
                icon={Trash2}
                label="Revoke invite"
                danger
                onClick={() =>
                  setConfirm({
                    type: "revoke",
                    userId: member.id,
                    label: displayLabel,
                  })
                }
              />
            ) : null}
          </div>
        ) : null}
      </details>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.type === "revoke"
            ? "Revoke invite?"
            : confirm?.type === "suspend"
              ? "Suspend admin account?"
              : confirm?.type === "resend"
                ? "Resend invite?"
                : confirm?.type === "reset"
                  ? "Send password reset?"
                  : "Activate admin account?"
        }
        description={
          confirm?.type === "revoke"
            ? `Revoke the pending invite for ${confirm.label}? They will lose portal access.`
            : confirm?.type === "suspend"
              ? `Suspend ${confirm?.label ?? "this admin"}? Sessions are revoked and they cannot sign in.`
              : confirm?.type === "resend"
                ? `Send a fresh invite email to ${confirm?.label ?? "this admin"}? Prior invite links stop working after they set a password.`
                : confirm?.type === "reset"
                  ? `Send a password reset email to ${confirm?.label ?? "this admin"}?`
                  : `Reactivate ${confirm?.label ?? "this admin"}?`
        }
        confirmLabel={
          confirm?.type === "revoke"
            ? "Revoke"
            : confirm?.type === "reset" || confirm?.type === "resend"
              ? "Send email"
              : "Confirm"
        }
        variant={confirm?.type === "revoke" ? "danger" : "default"}
        loading={pending}
        onConfirm={() => confirm && runAction(confirm)}
        onCancel={() => {
          if (pending) return;
          setConfirm(null);
        }}
      />
    </>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
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
      className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
