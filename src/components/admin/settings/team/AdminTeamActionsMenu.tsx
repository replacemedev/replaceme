"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminUser,
  triggerAdminPasswordReset,
  updateAdminRole,
  updateAdminStatus,
} from "@/actions/admin/team";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AdminSelfPasswordActions } from "@/components/admin/settings/AdminSelfPasswordActions";
import type { AdminRole, AdminTeamRow } from "@/types/admin.types";

interface AdminTeamActionsMenuProps {
  member: AdminTeamRow;
  currentUserId: string;
}

type PendingAction =
  | { type: "suspend"; userId: string; label: string }
  | { type: "unsuspend"; userId: string; label: string }
  | { type: "reset"; userId: string; label: string }
  | { type: "delete"; userId: string; label: string }
  | { type: "role"; userId: string; label: string; nextRole: AdminRole };

export function AdminTeamActionsMenu({
  member,
  currentUserId,
}: AdminTeamActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<PendingAction | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const isSelf = member.id === currentUserId;
  const displayLabel =
    [member.first_name, member.last_name].filter(Boolean).join(" ").trim() ||
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
        case "delete":
          result = await deleteAdminUser({ userId: action.userId });
          break;
        case "role":
          result = await updateAdminRole({
            userId: action.userId,
            admin_role: action.nextRole,
          });
          break;
        default:
          result = { success: false, error: "Unknown action" };
      }

      if (result.success) {
        toast.success("Admin account updated");
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

  const nextRole: AdminRole =
    member.admin_role === "superadmin" ? "moderator" : "superadmin";

  return (
    <>
      <details
        ref={detailsRef}
        className="relative"
        onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          <span className="sr-only">Actions for {displayLabel}</span>
        </summary>
        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
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
            <MenuButton
              icon={Shield}
              label={
                member.admin_role === "superadmin"
                  ? "Demote to moderator"
                  : "Promote to super admin"
              }
              onClick={() =>
                setConfirm({
                  type: "role",
                  userId: member.id,
                  label: displayLabel,
                  nextRole,
                })
              }
            />
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
            <MenuButton
              icon={Trash2}
              label="Delete account"
              danger
              onClick={() =>
                setConfirm({
                  type: "delete",
                  userId: member.id,
                  label: displayLabel,
                })
              }
            />
          </div>
        ) : null}
      </details>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.type === "delete"
            ? "Delete admin account?"
            : confirm?.type === "suspend"
              ? "Suspend admin account?"
              : confirm?.type === "role"
                ? "Change admin role?"
                : confirm?.type === "reset"
                  ? "Send password reset?"
                  : "Activate admin account?"
        }
        description={
          confirm?.type === "delete"
            ? `This permanently removes ${confirm.label} and revokes all admin access.`
            : confirm?.type === "suspend"
              ? `Suspend ${confirm?.label ?? "this admin"}? They will be banned from signing in.`
              : confirm?.type === "role"
                ? `Change ${confirm?.label ?? "this admin"} to ${confirm?.nextRole === "superadmin" ? "super admin" : "moderator"}?`
                : confirm?.type === "reset"
                  ? `Send a password reset email to ${confirm?.label ?? "this admin"}?`
                  : `Reactivate ${confirm?.label ?? "this admin"}?`
        }
        confirmLabel={
          confirm?.type === "delete"
            ? "Delete"
            : confirm?.type === "reset"
              ? "Send reset email"
              : "Confirm"
        }
        variant={confirm?.type === "delete" ? "danger" : "default"}
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
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
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
