"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createAdminUser } from "@/actions/admin/team";
import { Button } from "@/components/ui/button";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import type { AdminRole } from "@/types/admin.types";

interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

export function CreateAdminDialog({
  open,
  onClose,
  onCreated,
}: CreateAdminDialogProps) {
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAdminRole("moderator");
  };

  const handleClose = () => {
    if (pending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createAdminUser({
        fullName,
        username,
        email,
        password,
        confirmPassword,
        admin_role: adminRole,
      });

      if (result.success) {
        toast.success("Admin account created");
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
      title="Add admin account"
      description="Creates a new internal admin with portal access."
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={pending} className="!w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-admin-form"
            disabled={pending}
            className="!w-auto gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden />
            )}
            Create admin
          </Button>
        </div>
      }
    >
      <form id="create-admin-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Full name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClassName}
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Username</span>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClassName}
            autoComplete="username"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Role</span>
          <select
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as AdminRole)}
            className={inputClassName}
          >
            <option value="moderator">Moderator</option>
            <option value="superadmin">Super admin</option>
          </select>
        </label>
        <label className="sm:col-span-2 grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            autoComplete="email"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Temporary password</span>
          <input
            required
            type="password"
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            autoComplete="new-password"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">Confirm password</span>
          <input
            required
            type="password"
            minLength={12}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClassName}
            autoComplete="new-password"
          />
        </label>
      </form>
    </AdminDrawer>
  );
}
