/**
 * Fixed admin module capability keys.
 * Superadmins ignore the list (full access). Moderators are scoped by grants.
 */

export const ADMIN_CAPABILITIES = [
  "dashboard",
  "users",
  "applications",
  "jobs",
  "identity",
  "reports",
  "moderation",
  "disputes",
  "notifications",
  "billing",
  "audit_log",
  "security",
  "settings",
  "team",
  "email",
] as const;

export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number];

/** Capabilities that only superadmins may hold (never grantable to moderators). */
export const SUPERADMIN_ONLY_CAPABILITIES = ["team", "email"] as const satisfies readonly AdminCapability[];

/** Default grants for a new moderator invite (Trust & Safety need-to-know). */
export const DEFAULT_MODERATOR_CAPABILITIES: readonly AdminCapability[] = [
  "dashboard",
  "identity",
  "reports",
  "moderation",
  "disputes",
  "notifications",
  "settings",
] as const;

/** All capabilities (superadmin effective set). */
export const ALL_ADMIN_CAPABILITIES: readonly AdminCapability[] = ADMIN_CAPABILITIES;

export type AdminCapabilityGroup = {
  label: string;
  capabilities: readonly AdminCapability[];
};

export const ADMIN_CAPABILITY_GROUPS: readonly AdminCapabilityGroup[] = [
  {
    label: "Operations",
    capabilities: ["dashboard", "users", "applications", "jobs"],
  },
  {
    label: "Trust & Safety",
    capabilities: [
      "identity",
      "reports",
      "moderation",
      "disputes",
      "notifications",
    ],
  },
  {
    label: "Revenue",
    capabilities: ["billing"],
  },
  {
    label: "Platform",
    capabilities: ["audit_log", "security", "settings"],
  },
] as const;

export const ADMIN_CAPABILITY_LABELS: Record<AdminCapability, string> = {
  dashboard: "Dashboard",
  users: "Users",
  applications: "Applications",
  jobs: "Job Posts",
  identity: "Identity",
  reports: "Reports",
  moderation: "Moderation",
  disputes: "Disputes",
  notifications: "Notifications",
  billing: "Billing",
  audit_log: "Audit Log",
  security: "Security",
  settings: "Settings",
  team: "Admin Team",
  email: "Email",
};

/** Capabilities moderators may be granted in the invite/edit UI. */
export const GRANTABLE_MODERATOR_CAPABILITIES: readonly AdminCapability[] =
  ADMIN_CAPABILITIES.filter(
    (cap) =>
      !(SUPERADMIN_ONLY_CAPABILITIES as readonly string[]).includes(cap)
  );

const CAPABILITY_SET = new Set<string>(ADMIN_CAPABILITIES);

export function isAdminCapability(value: string): value is AdminCapability {
  return CAPABILITY_SET.has(value);
}

export function normalizeCapabilities(
  raw: readonly string[] | null | undefined
): AdminCapability[] {
  if (!raw?.length) return [];
  const seen = new Set<AdminCapability>();
  for (const item of raw) {
    if (isAdminCapability(item)) seen.add(item);
  }
  return ADMIN_CAPABILITIES.filter((cap) => seen.has(cap));
}

export function sanitizeModeratorCapabilities(
  raw: readonly string[] | null | undefined
): AdminCapability[] {
  const normalized = normalizeCapabilities(raw).filter(
    (cap) =>
      !(SUPERADMIN_ONLY_CAPABILITIES as readonly string[]).includes(cap)
  );
  // Always include dashboard + settings for usable portal access.
  const withBaseline = new Set<AdminCapability>(normalized);
  withBaseline.add("dashboard");
  withBaseline.add("settings");
  return ADMIN_CAPABILITIES.filter((cap) => withBaseline.has(cap));
}

export function effectiveCapabilities(input: {
  adminRole: "moderator" | "superadmin";
  capabilities: readonly string[] | null | undefined;
}): AdminCapability[] {
  if (input.adminRole === "superadmin") {
    return [...ALL_ADMIN_CAPABILITIES];
  }
  return sanitizeModeratorCapabilities(input.capabilities);
}

export function hasCapability(
  caps: readonly AdminCapability[],
  required: AdminCapability
): boolean {
  return caps.includes(required);
}

/** Short summary for table chips (group labels that have ≥1 granted module). */
export function summarizeCapabilities(
  caps: readonly AdminCapability[],
  adminRole: "moderator" | "superadmin"
): string[] {
  if (adminRole === "superadmin") return ["Full access"];
  const labels: string[] = [];
  for (const group of ADMIN_CAPABILITY_GROUPS) {
    const granted = group.capabilities.filter((c) => caps.includes(c));
    if (granted.length === 0) continue;
    if (
      granted.length === group.capabilities.length ||
      (group.label === "Trust & Safety" && granted.length >= 3)
    ) {
      labels.push(group.label);
    } else {
      labels.push(...granted.map((c) => ADMIN_CAPABILITY_LABELS[c]));
    }
  }
  return labels.length > 0 ? labels : ["Limited"];
}

/** Map admin route prefixes to required capability. */
export const ROUTE_CAPABILITY_MAP: ReadonlyArray<{
  prefix: string;
  capability: AdminCapability;
  superAdminOnly?: boolean;
}> = [
  { prefix: "/admin/settings/team", capability: "team", superAdminOnly: true },
  { prefix: "/admin/reports/email", capability: "email", superAdminOnly: true },
  { prefix: "/admin/dashboard", capability: "dashboard" },
  { prefix: "/admin/users", capability: "users" },
  { prefix: "/admin/applications", capability: "applications" },
  { prefix: "/admin/jobs", capability: "jobs" },
  { prefix: "/admin/identity", capability: "identity" },
  { prefix: "/admin/reports", capability: "reports" },
  { prefix: "/admin/moderation", capability: "moderation" },
  { prefix: "/admin/disputes", capability: "disputes" },
  { prefix: "/admin/notifications", capability: "notifications" },
  { prefix: "/admin/billing", capability: "billing" },
  { prefix: "/admin/billing-ops", capability: "billing" },
  { prefix: "/admin/revenue", capability: "billing" },
  { prefix: "/admin/audit-log", capability: "audit_log" },
  { prefix: "/admin/security", capability: "security" },
  { prefix: "/admin/settings", capability: "settings" },
];

export function capabilityForPath(pathname: string): {
  capability: AdminCapability;
  superAdminOnly?: boolean;
} | null {
  const matches = ROUTE_CAPABILITY_MAP.filter(
    (row) =>
      pathname === row.prefix || pathname.startsWith(`${row.prefix}/`)
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.prefix.length - a.prefix.length)[0];
}

export const ADMIN_INVITE_EXPIRY_DAYS = 7;
