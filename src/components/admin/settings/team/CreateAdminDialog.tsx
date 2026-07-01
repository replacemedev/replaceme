"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { createAdminUser } from "@/actions/admin/team";
import { Button } from "@/components/ui/button";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 open:flex open:flex-col"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Add admin account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Creates a new internal admin with portal access.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
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
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} className="w-auto gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden />
            )}
            Create admin
          </Button>
        </div>
      </form>
    </dialog>
  );
}
