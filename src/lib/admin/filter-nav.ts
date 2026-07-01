import type { AdminNavGroup, AdminNavItem } from "@/config/adminNav";

export function filterAdminNavItems(
  items: AdminNavItem[],
  isSuperAdmin: boolean
): AdminNavItem[] {
  if (isSuperAdmin) return items;
  return items.filter((item) => !item.superAdminOnly);
}

export function filterAdminNavGroups(
  groups: AdminNavGroup[],
  isSuperAdmin: boolean
): AdminNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterAdminNavItems(group.items, isSuperAdmin),
    }))
    .filter((group) => group.items.length > 0);
}
