"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminTeamMemberDeepDive,
  type AdminTeamMemberDeepDive,
} from "@/actions/admin/team";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import {
  effectiveCapabilities,
  summarizeCapabilities,
} from "@/lib/admin/capabilities";
import { formatFullName } from "@/lib/format/name";

interface AdminTeamMemberDetailsDrawerProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function initialsFrom(data: AdminTeamMemberDeepDive): string {
  const name =
    formatFullName(data.firstName, data.lastName).trim() ||
    data.displayName ||
    data.email ||
    "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

export function AdminTeamMemberDetailsDrawer({
  userId,
  open,
  onClose,
}: AdminTeamMemberDetailsDrawerProps) {
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<AdminTeamMemberDeepDive | null>(null);

  useEffect(() => {
    if (!open || !userId) {
      setData(null);
      return;
    }

    let cancelled = false;
    startTransition(async () => {
      const result = await getAdminTeamMemberDeepDive(userId);
      if (cancelled) return;
      if (result.success) {
        setData(result.data);
      } else {
        setData(null);
        toast.error(result.error);
        onClose();
      }
    });

    return () => {
      cancelled = true;
    };
    // ponytail: onClose is stable enough for error path; omit to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const fullName = data
    ? formatFullName(data.firstName, data.lastName).trim() ||
      data.displayName ||
      data.email ||
      "Admin"
    : "Loading…";

  const accessLabels = data
    ? summarizeCapabilities(
        effectiveCapabilities({
          adminRole: data.adminRole,
          capabilities: data.capabilities,
        }),
        data.adminRole
      )
    : [];

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title="Personal details"
      description="Super admin audit view — internal staff PII"
      size="narrow"
    >
      {pending && !data ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-[#006e2f]" aria-hidden />
          <p className="text-sm font-medium">Loading profile…</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <AvatarImage
              src={data.avatarUrl}
              alt={fullName}
              initials={initialsFrom(data)}
              size="lg"
              priority
              containerClassName="border border-slate-200 bg-slate-100 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-extrabold text-slate-900">
                {fullName}
              </p>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {data.adminRole === "superadmin" ? "Super admin" : "Moderator"}
                {data.department ? ` · ${data.department}` : ""}
              </p>
              <div className="mt-2">
                <StatusBadge status={data.accountStatus} />
              </div>
            </div>
          </div>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="h-4 w-4 shrink-0 text-[#006e2f]" aria-hidden />
              <h3 className="text-sm font-bold">Identity & contact</h3>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Legal name" value={fullName} />
              <DetailRow
                label="Email"
                value={
                  data.email ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate">{data.email}</span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Display name"
                value={data.displayName?.trim() || "—"}
              />
              <DetailRow label="Joined" value={formatWhen(data.createdAt)} />
            </dl>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Shield className="h-4 w-4 shrink-0 text-[#006e2f]" aria-hidden />
              <h3 className="text-sm font-bold">Permission scopes</h3>
            </div>
            {data.adminRole === "superadmin" ? (
              <p className="text-sm font-medium text-slate-600">
                Full platform access (super admin).
              </p>
            ) : accessLabels.length === 0 ? (
              <p className="text-sm text-slate-500">No module grants.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {accessLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              {data.mfaEnrolled ? (
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-[#006e2f]"
                  aria-hidden
                />
              ) : (
                <ShieldAlert
                  className="h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden
                />
              )}
              <h3 className="text-sm font-bold">Security status</h3>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="MFA enrollment"
                value={
                  data.mfaEnrolled
                    ? `Enrolled${data.mfaFactorCount > 1 ? ` (${data.mfaFactorCount} factors)` : ""}`
                    : "Not enrolled"
                }
              />
              <DetailRow
                label="Last login"
                value={formatWhen(data.lastSignInAt)}
              />
              <DetailRow
                label="Last login IP"
                value={
                  data.lastSignInIp ? (
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">
                      {data.lastSignInIp}
                    </code>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Invite accepted"
                value={formatWhen(data.inviteAcceptedAt)}
              />
            </dl>
          </section>
        </div>
      ) : null}
    </AdminDrawer>
  );
}
