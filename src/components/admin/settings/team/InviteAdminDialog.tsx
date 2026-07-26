"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteAdminUser } from "@/actions/admin/team";
import { AdminCapabilityChecklist } from "@/components/admin/settings/team/AdminCapabilityChecklist";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MODERATOR_CAPABILITIES,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import type { AdminRole } from "@/types/admin.types";

interface InviteAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

export function InviteAdminDialog({
  open,
  onClose,
  onCreated,
}: InviteAdminDialogProps) {
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");
  const [capabilities, setCapabilities] = useState<AdminCapability[]>([
    ...DEFAULT_MODERATOR_CAPABILITIES,
  ]);

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setAdminRole("moderator");
    setCapabilities([...DEFAULT_MODERATOR_CAPABILITIES]);
  };

  const handleClose = () => {
    if (pending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await inviteAdminUser({
        fullName,
        username,
        email,
        admin_role: adminRole,
        capabilities: adminRole === "superadmin" ? [] : capabilities,
      });

      if (result.success) {
        toast.success("Invite sent — they have 7 days to set a password");
        resetForm();
        onCreated();
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AdminDrawer
      open={open}
      onClose={handleClose}
      title="Invite admin"
      description="Sends a secure email invite. No temporary password is shared."
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={pending}
            className="!w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-admin-form"
            disabled={pending}
            className="!w-auto gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden />
            )}
            Send invite
          </Button>
        </div>
      }
    >
      <form id="invite-admin-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Full name
          </label>
          <input
            className={inputClassName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            disabled={pending}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Username
          </label>
          <input
            className={inputClassName}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={pending}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Work email
          </label>
          <input
            type="email"
            className={inputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={pending}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Role
          </label>
          <select
            className={inputClassName}
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as AdminRole)}
            disabled={pending}
          >
            <option value="moderator">Moderator</option>
            <option value="superadmin">Super admin</option>
          </select>
        </div>
        <AdminCapabilityChecklist
          value={capabilities}
          onChange={setCapabilities}
          disabled={pending}
          fullAccess={adminRole === "superadmin"}
        />
      </form>
    </AdminDrawer>
  );
}
