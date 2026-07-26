/**
 * Human-readable audit target labels + admin deep-links.
 * ponytail: static map — add rows when new target_type values appear in writers.
 */

export type AuditTargetResolved = {
  label: string;
  href: string | null;
  typeLabel: string;
};

const TYPE_LABELS: Record<string, string> = {
  profile: "Profile",
  worker: "Worker",
  user: "User",
  admin_profile: "Admin",
  admin_capability: "Capability",
  job: "Job",
  application: "Application",
  dispute: "Dispute",
  user_report: "User report",
  chat_thread: "Thread",
  report: "Report",
  job_report: "Job report",
  employer_subscription: "Subscription",
};

function shortId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

export function resolveAuditTarget(
  targetType: string | null | undefined,
  targetId: string | null | undefined,
  options?: {
    displayName?: string | null;
    role?: "worker" | "employer" | null;
  }
): AuditTargetResolved {
  const type = targetType?.trim() || null;
  const id = targetId?.trim() || null;
  const typeLabel = type ? (TYPE_LABELS[type] ?? type.replace(/_/g, " ")) : "—";
  const name = options?.displayName?.trim() || null;

  if (!type || !id) {
    return {
      label: type ? typeLabel : "—",
      href: null,
      typeLabel,
    };
  }

  const named = name ? `${typeLabel}: ${name}` : `${typeLabel}: ${shortId(id)}`;

  switch (type) {
    case "worker":
      return { label: named, href: `/admin/users/workers/${id}`, typeLabel };
    case "profile":
    case "user": {
      if (options?.role === "employer") {
        return {
          label: named,
          href: `/admin/users/employers/${id}`,
          typeLabel,
        };
      }
      return { label: named, href: `/admin/users/workers/${id}`, typeLabel };
    }
    case "admin_profile":
      return { label: named, href: "/admin/settings/team", typeLabel };
    case "admin_capability":
      return { label: named, href: "/admin/settings/team", typeLabel };
    case "job":
      return { label: named, href: `/admin/jobs/${id}`, typeLabel };
    case "application":
      return { label: named, href: `/admin/applications/${id}`, typeLabel };
    case "dispute":
    case "user_report":
      return { label: named, href: `/admin/disputes/${id}`, typeLabel };
    case "chat_thread":
      return { label: named, href: `/admin/moderation/${id}`, typeLabel };
    case "report":
    case "job_report":
      return { label: named, href: "/admin/reports", typeLabel };
    case "employer_subscription":
      return {
        label: named,
        href: `/admin/users/employers/${id}`,
        typeLabel,
      };
    default:
      return { label: named, href: null, typeLabel };
  }
}

export function formatAuditAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Extract before/after payloads from metadata for the detail drawer. */
export function extractAuditDiff(metadata: Record<string, unknown> | null): {
  before: unknown | null;
  after: unknown | null;
  rest: Record<string, unknown>;
} {
  if (!metadata) return { before: null, after: null, rest: {} };
  const rest = { ...metadata };
  const before =
    "before" in rest
      ? rest.before
      : "previous" in rest
        ? rest.previous
        : null;
  const after =
    "after" in rest ? rest.after : "new" in rest ? rest.new : null;
  delete rest.before;
  delete rest.after;
  delete rest.previous;
  delete rest.new;
  return { before: before ?? null, after: after ?? null, rest };
}
