import type { AppRole } from "@/lib/auth/role";
import { ROLE_HOME_PATH } from "@/config/navigation";

const WORKER_PROFILE_PREFIXES = ["/workers/", "/profile/", "/candidates"] as const;

function decodePath(raw: string): string | null {
  try {
    const path = decodeURIComponent(raw.trim());
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    if (path.includes("..") || path.includes("\\")) return null;
    return path;
  } catch {
    return null;
  }
}

/** Guest-safe callback paths stored on auth links (job funnel). */
export function parseGuestCallbackUrl(
  raw: string | null | undefined
): string | null {
  const path = raw ? decodePath(raw) : null;
  if (!path) return null;
  if (/^\/jobs\/[0-9a-f-]{36}$/i.test(path)) return path;
  return null;
}

function isWorkerProfileLeakPath(path: string): boolean {
  return WORKER_PROFILE_PREFIXES.some(
    (prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix)
  );
}

/**
 * Resolves post-auth redirect. Job board callbacks send workers to the apply-ready route.
 */
export function resolvePostAuthRedirect(
  role: AppRole,
  rawCallback: string | null | undefined
): string {
  const callback = rawCallback ? decodePath(rawCallback) : null;

  if (callback) {
    const publicJobMatch = /^\/jobs\/([0-9a-f-]{36})$/i.exec(callback);
    if (publicJobMatch) {
      if (role === "worker") {
        return `/worker/jobs/${publicJobMatch[1]}`;
      }
      return ROLE_HOME_PATH[role];
    }

    if (isWorkerProfileLeakPath(callback)) {
      return role === "employer" ? "/pricing" : ROLE_HOME_PATH[role];
    }

    if (
      callback.startsWith("/worker/") ||
      callback.startsWith("/employer/") ||
      callback.startsWith("/admin/") ||
      callback.startsWith("/jobs/")
    ) {
      return callback;
    }
  }

  return ROLE_HOME_PATH[role];
}

export function buildAuthHref(
  base: "/signin" | "/signup",
  callbackPath: string
): string {
  const params = new URLSearchParams({ callbackUrl: callbackPath });
  return `${base}?${params.toString()}`;
}
