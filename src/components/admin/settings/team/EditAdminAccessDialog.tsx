"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateAdminCapabilities } from "@/actions/admin/team";
import { AdminCapabilityChecklist } from "@/components/admin/settings/team/AdminCapabilityChecklist";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MODERATOR_CAPABILITIES,
  normalizeCapabilities,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import type { AdminRole, AdminTeamRow } from "@/types/admin.types";
import { formatFullName } from "@/lib/format/name";

interface EditAdminAccessDialogProps {
  member: AdminTeamRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

export function EditAdminAccessDialog({
  member,
  open,
  onClose,
  onSaved,
}: EditAdminAccessDialogProps) {
  const [pending, startTransition] = useTransition();
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");
  const [capabilities, setCapabilities] = useState<AdminCapability[]>([
    ...DEFAULT_MODERATOR_CAPABILITIES,
  ]);

  useEffect(() => {
    if (!member || !open) return;
    setAdminRole(member.admin_role);
    const caps = normalizeCapabilities(member.capabilities);
    setCapabilities(
      caps.length > 0 ? caps : [...DEFAULT_MODERATOR_CAPABILITIES]
    );
  }, [member, open]);

  if (!member) return null;

  const displayLabel =
    formatFullName(member.first_name, member.middle_name, member.last_name).trim() ||
    member.email ||
    "Admin";

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateAdminCapabilities({
        userId: member.id,
        admin_role: adminRole,
        capabilities: adminRole === "superadmin" ? [] : capabilities,
      });

      if (result.success) {
        toast.success("Access updated");
        onSaved();
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
      title="Edit access"
      description={`Role and module grants for ${displayLabel}.`}
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
            form="edit-admin-access-form"
            disabled={pending}
            className="!w-auto gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Shield className="h-4 w-4" aria-hidden />
            )}
            Save access
          </Button>
        </div>
      }
    >
      <form
        id="edit-admin-access-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
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
