"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateCompanyVerification } from "@/actions/admin/company-verification";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";

interface CompanyVerificationCardProps {
  employerId: string;
  status: string;
  verifiedAt: string | null;
  hiringRegions: string[];
}

export function CompanyVerificationCard({
  employerId,
  status,
  verifiedAt,
  hiringRegions,
}: CompanyVerificationCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isVerified = status === "verified";

  const toggle = () => {
    startTransition(async () => {
      const result = await updateCompanyVerification({
        employerId,
        status: isVerified ? "unverified" : "verified",
      });
      if (result.success) {
        toast.success(isVerified ? "Company unmarked" : "Company verified");
        router.refresh();
      } else {
        toast.error(result.error ?? "Update failed");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Company trust</h3>
            <StatusBadge status={isVerified ? "verified" : "unverified"} />
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Marketplace trust badge only, not tax KYC. Verified companies show a
            clearer signal to workers browsing listings.
          </p>
          {isVerified && verifiedAt ? (
            <p className="text-xs text-slate-400">
              Verified{" "}
              {new Date(verifiedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          ) : null}
          {hiringRegions.length > 0 ? (
            <p className="text-xs text-slate-500">
              Hiring regions:{" "}
              <span className="font-semibold text-slate-700">
                {hiringRegions.join(", ")}
              </span>
            </p>
          ) : (
            <p className="text-xs text-slate-400">No hiring regions set yet.</p>
          )}
        </div>
        <Button
          type="button"
          variant={isVerified ? "outline" : "success"}
          disabled={pending}
          onClick={toggle}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 sm:w-auto"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <BadgeCheck className="h-4 w-4" aria-hidden />
          )}
          {isVerified ? "Remove verification" : "Mark verified"}
        </Button>
      </div>
    </div>
  );
}
