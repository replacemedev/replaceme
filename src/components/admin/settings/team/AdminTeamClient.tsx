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
import { Button } from "@/components/ui/button";
import { AdminTeamActionsMenu } from "@/components/admin/settings/team/AdminTeamActionsMenu";
import { AdminTeamActivityTab } from "@/components/admin/settings/team/AdminTeamActivityTab";
import { CreateAdminDialog } from "@/components/admin/settings/team/CreateAdminDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminAuditLogRow, AdminTeamRow } from "@/types/admin.types";
import { formatFullName } from "@/lib/format/name";

type TeamTab = "team" | "activity";

interface AdminTeamClientProps {
  members: AdminTeamRow[];
  activity: AdminAuditLogRow[];
  currentUserId: string;
}

function displayName(member: AdminTeamRow): string {
  const name = formatFullName(member.first_name, member.middle_name, member.last_name).trim();
  return name || member.display_name || member.email || "Admin";
}

function formatRole(role: AdminTeamRow["admin_role"]): string {
  return role === "superadmin" ? "Super admin" : "Moderator";
}

function formatLastLogin(value: string | null | undefined): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export function AdminTeamClient({
  members,
  activity,
  currentUserId,
}: AdminTeamClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TeamTab>("team");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevTab, setPrevTab] = useState(tab);

  if (search !== prevSearch || tab !== prevTab) {
    setPrevSearch(search);
    setPrevTab(tab);
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return members;
    return members.filter((member) => {
      const name = displayName(member).toLowerCase();
      return (
        name.includes(q) ||
        (member.email?.toLowerCase().includes(q) ?? false) ||
        member.admin_role.includes(q)
      );
    });
  }, [members, search]);

  const itemsPerPage = 20;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedMembers = useMemo(() => {
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, startIndex, itemsPerPage]);

  return (
    <>
      <AdminPageHeader
        title="Admin Team"
        description="Manage internal admin accounts, roles, and access."
      >
        {tab === "team" ? (
          <Button
            type="button"
            className="w-auto gap-2 sm:shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Add admin
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
            searchPlaceholder="Search by name, email, or role…"
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden />}
              title={members.length === 0 ? "No admin accounts" : "No matches"}
              description={
                members.length === 0
                  ? "Create the first internal admin account for your team."
                  : "Try a different search term."
              }
              action={
                members.length === 0 ? (
                  <Button
                    type="button"
                    className="w-auto gap-2"
                    onClick={() => setCreateOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Add admin
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
                <table className="w-full text-sm">
                <thead className={ADMIN_TABLE_HEAD}>
                  <tr>
                    <th className={ADMIN_TABLE_TH}>Email</th>
                    <th className={ADMIN_TABLE_TH}>Role</th>
                    <th className={ADMIN_TABLE_TH}>Status</th>
                    <th className={ADMIN_TABLE_TH}>Last login</th>
                    <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className={ADMIN_TABLE_ROW}>
                      <td className={ADMIN_TABLE_TD}>
                        <p className="font-semibold text-slate-900">
                          {displayName(member)}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </td>
                      <td className={ADMIN_TABLE_TD}>
                        <span className="text-xs font-semibold text-slate-700">
                          {formatRole(member.admin_role)}
                        </span>
                      </td>
                      <td className={ADMIN_TABLE_TD}>
                        <StatusBadge status={member.account_status} />
                      </td>
                      <td className={`${ADMIN_TABLE_TD} text-xs text-slate-500 whitespace-nowrap`}>
                        {formatLastLogin(member.last_sign_in_at)}
                      </td>
                      <td className={`${ADMIN_TABLE_TD} text-right`}>
                        <AdminTeamActionsMenu
                          member={member}
                          currentUserId={currentUserId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      <CreateAdminDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
