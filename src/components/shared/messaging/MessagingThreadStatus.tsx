import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";

interface MessagingThreadStatusProps {
  blockedReason: string | null;
  role: "worker" | "employer";
  planSlug?: string;
}

export function MessagingThreadStatus({
  blockedReason,
  role,
  planSlug = "discovery",
}: MessagingThreadStatusProps) {
  if (!blockedReason) return null;

  if (role === "employer") {
    return (
      <div className="mx-4 mt-4">
        <UnlockOverlay feature="messaging" currentPlan={planSlug} compact />
      </div>
    );
  }

  return (
    <div
      className="mx-4 mt-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm"
      role="status"
    >
      <p className="text-sm font-bold text-slate-900">Messaging unavailable</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
        This employer is on the Discovery plan and cannot send messages yet. They
        may upgrade to unlock direct messaging.
      </p>
    </div>
  );
}
