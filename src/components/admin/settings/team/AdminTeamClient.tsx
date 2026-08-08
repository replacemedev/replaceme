"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { Button } from "@/components/ui/button";
import { AdminTeamActionsMenu } from "@/components/admin/settings/team/AdminTeamActionsMenu";
import { AdminTeamActivityTab } from "@/components/admin/settings/team/AdminTeamActivityTab";
import { AdminTeamMemberDetailsDrawer } from "@/components/admin/settings/team/AdminTeamMemberDetailsDrawer";
import { EditAdminAccessDialog } from "@/components/admin/settings/team/EditAdminAccessDialog";
import { InviteAdminDialog } from "@/components/admin/settings/team/InviteAdminDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  effectiveCapabilities,
  summarizeCapabilities,
} from "@/lib/admin/capabilities";
import {
  isInviteExpired,
  isInvitePending,
} from "@/lib/admin/invite-status";
import type { AdminAuditLogRow, AdminTeamRow } from "@/types/admin.types";
import { formatFullName } from "@/lib/format/name";

type TeamTab = "team" | "activity";
type StatusFilter = "all" | "active" | "suspended" | "pending";

interface AdminTeamClientProps {
  members: AdminTeamRow[];
  activity: AdminAuditLogRow[];
  currentUserId: string;
  /** Session is super admin — gates PII deep-dive. */
  isSuperAdmin?: boolean;
}

function displayName(member: AdminTeamRow): string {
  const name = formatFullName(member.first_name, member.last_name).trim();
  return name || member.display_name || member.email || "Admin";
}

function memberInitials(member: AdminTeamRow): string {
  const name = displayName(member);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatRole(role: AdminTeamRow["admin_role"]): string {
  return role === "superadmin" ? "Super admin" : "Moderator";
}

function formatLastLogin(value: string | null | undefined): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

function inviteBadge(member: AdminTeamRow): {
  label: string;
  className: string;
} | null {
  if (!isInvitePending(member)) {
    if (member.invite_accepted_at || member.last_sign_in_at) {
      return {
        label: "Active access",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }
    return null;
  }
  if (isInviteExpired(member.invited_at)) {
    return {
      label: "Invite expired",
      className: "bg-amber-50 text-amber-900 border-amber-200",
    };
  }
  return {
    label: "Invite pending",
    className: "bg-sky-50 text-sky-900 border-sky-200",
  };
}

function MemberIdentity({ member }: { member: AdminTeamRow }) {
  const name = displayName(member);
  const invite = inviteBadge(member);

  return (
    <div className="flex min-w-0 items-start gap-3">
      <AvatarImage
        src={member.avatar_url ?? null}
        alt={name}
        initials={memberInitials(member)}
        size="sm"
        containerClassName="border border-slate-200 bg-slate-100"
      />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{member.email}</p>
        {member.department ? (
          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
            {member.department}
          </p>
        ) : null}
        {invite ? (
          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${invite.className}`}
          >
            {invite.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function AdminTeamClient({
  members,
  activity,
  currentUserId,
  isSuperAdmin = false,
}: AdminTeamClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TeamTab>("team");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<AdminTeamRow | null>(null);
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevTab, setPrevTab] = useState(tab);
  const [prevStatus, setPrevStatus] = useState(statusFilter);

  if (
    search !== prevSearch ||
    tab !== prevTab ||
    statusFilter !== prevStatus
  ) {
    setPrevSearch(search);
    setPrevTab(tab);
    setPrevStatus(statusFilter);
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((member) => {
      if (statusFilter === "active" && member.account_status !== "active") {
        return false;
      }
      if (
        statusFilter === "suspended" &&
        member.account_status !== "suspended"
      ) {
        return false;
      }
      if (statusFilter === "pending" && !isInvitePending(member)) {
        return false;
      }

      if (!q) return true;
      const name = displayName(member).toLowerCase();
      const access = summarizeCapabilities(
        effectiveCapabilities({
          adminRole: member.admin_role,
          capabilities: member.capabilities,
        }),
        member.admin_role
      )
        .join(" ")
        .toLowerCase();
      return (
        name.includes(q) ||
        (member.email?.toLowerCase().includes(q) ?? false) ||
        (member.department?.toLowerCase().includes(q) ?? false) ||
        member.admin_role.includes(q) ||
        access.includes(q)
      );
    });
  }, [members, search, statusFilter]);

  const itemsPerPage = 20;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedMembers = useMemo(() => {
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, startIndex, itemsPerPage]);

  const pendingCount = members.filter((m) => isInvitePending(m)).length;

  return (
    <>
      <AdminPageHeader
        title="Admin Team"
        description="Invite moderators, grant module access, and review team activity."
      >
        {tab === "team" ? (
          <Button
            type="button"
            className="w-auto gap-2 sm:shrink-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Invite admin
          </Button>
        ) : null}
      </AdminPageHeader>

      <AdminFilterPills
        options={["team", "activity"]}
        value={tab}
        onChange={(value) => setTab(value as TeamTab)}
        counts={{
          team: members.length,
          activity: activity.length,
        }}
      />

      {tab === "activity" ? (
        <AdminTeamActivityTab logs={activity} />
      ) : (
        <>
          <AdminFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, email, role, or access…"
          />

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["active", "Active"],
                ["suspended", "Suspended"],
                ["pending", `Pending${pendingCount ? ` (${pendingCount})` : ""}`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === value
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden />}
              title={members.length === 0 ? "No admin accounts" : "No matches"}
              description={
                members.length === 0
                  ? "Invite the first moderator with Trust & Safety access."
                  : "Try a different search or filter."
              }
              action={
                members.length === 0 ? (
                  <Button
                    type="button"
                    className="w-auto gap-2"
                    onClick={() => setInviteOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Invite admin
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className={ADMIN_TABLE_HEAD}>
                    <tr>
                      <th className={ADMIN_TABLE_TH}>Member</th>
                      <th className={ADMIN_TABLE_TH}>Role</th>
                      <th className={ADMIN_TABLE_TH}>Access</th>
                      <th className={ADMIN_TABLE_TH}>Status</th>
                      <th className={ADMIN_TABLE_TH}>Last login</th>
                      <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member) => {
                      const accessLabels = summarizeCapabilities(
                        effectiveCapabilities({
                          adminRole: member.admin_role,
                          capabilities: member.capabilities,
                        }),
                        member.admin_role
                      );
                      return (
                        <tr key={member.id} className={ADMIN_TABLE_ROW}>
                          <td className={ADMIN_TABLE_TD}>
                            <MemberIdentity member={member} />
                          </td>
                          <td className={`${ADMIN_TABLE_TD} whitespace-nowrap`}>
                            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {formatRole(member.admin_role)}
                            </span>
                          </td>
                          <td className={`${ADMIN_TABLE_TD} whitespace-nowrap`}>
                            <div className="flex flex-wrap gap-1 items-center whitespace-nowrap">
                              {accessLabels.slice(0, 3).map((label) => (
                                <span
                                  key={label}
                                  className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 whitespace-nowrap"
                                >
                                  {label}
                                </span>
                              ))}
                              {accessLabels.length > 3 ? (
                                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                                  +{accessLabels.length - 3}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            <StatusBadge status={member.account_status} />
                          </td>
                          <td
                            className={`${ADMIN_TABLE_TD} text-xs text-slate-500 whitespace-nowrap`}
                          >
                            {formatLastLogin(member.last_sign_in_at)}
                          </td>
                          <td className={`${ADMIN_TABLE_TD} text-right`}>
                            <AdminTeamActionsMenu
                              member={member}
                              currentUserId={currentUserId}
                              canViewPersonalDetails={isSuperAdmin}
                              onEditAccess={() => setEditMember(member)}
                              onViewPersonalDetails={() =>
                                setDetailsUserId(member.id)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards — Safari-friendly flex, no 100vh traps */}
              <div className="md:hidden space-y-3">
                {paginatedMembers.map((member) => {
                  const accessLabels = summarizeCapabilities(
                    effectiveCapabilities({
                      adminRole: member.admin_role,
                      capabilities: member.capabilities,
                    }),
                    member.admin_role
                  );
                  return (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <MemberIdentity member={member} />
                        <AdminTeamActionsMenu
                          member={member}
                          currentUserId={currentUserId}
                          canViewPersonalDetails={isSuperAdmin}
                          onEditAccess={() => setEditMember(member)}
                          onViewPersonalDetails={() =>
                            setDetailsUserId(member.id)
                          }
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                          {formatRole(member.admin_role)}
                        </span>
                        <StatusBadge status={member.account_status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {accessLabels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Last login: {formatLastLogin(member.last_sign_in_at)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <TablePagination
                currentPage={activePage}
                totalItems={totalItems}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      <InviteAdminDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCreated={() => router.refresh()}
      />
      <EditAdminAccessDialog
        member={editMember}
        open={editMember !== null}
        onClose={() => setEditMember(null)}
        onSaved={() => router.refresh()}
      />
      <AdminTeamMemberDetailsDrawer
        userId={detailsUserId}
        open={detailsUserId !== null}
        onClose={() => setDetailsUserId(null)}
      />
    </>
  );
}
