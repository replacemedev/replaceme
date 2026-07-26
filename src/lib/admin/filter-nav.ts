import type { AdminNavGroup, AdminNavItem } from "@/config/adminNav";
import type { AdminCapability } from "@/lib/admin/capabilities";

export function filterAdminNavItems(
  items: AdminNavItem[],
  options: {
    isSuperAdmin: boolean;
    capabilities: readonly AdminCapability[];
  }
): AdminNavItem[] {
  const { isSuperAdmin, capabilities } = options;
  if (isSuperAdmin) return items;

  return items.filter((item) => {
    if (item.superAdminOnly) return false;
    if (!item.requiredCapability) return true;
    return capabilities.includes(item.requiredCapability);
  });
}

export function filterAdminNavGroups(
  groups: AdminNavGroup[],
  options: {
    isSuperAdmin: boolean;
    capabilities: readonly AdminCapability[];
  }
): AdminNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterAdminNavItems(group.items, options),
    }))
    .filter((group) => group.items.length > 0);
}
