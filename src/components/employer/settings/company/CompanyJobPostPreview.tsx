"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Building2, Briefcase } from "lucide-react";
import type { CompanyProfileInput } from "@/lib/validations/employer/company";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

interface CompanyJobPostPreviewProps {
  isProfileComplete?: boolean;
  planUsage?: EmployerPlanUsage | null;
}

export function CompanyJobPostPreview({
  isProfileComplete = false,
  planUsage = null,
}: CompanyJobPostPreviewProps) {
  const { watch } = useFormContext<CompanyProfileInput>();
  const companyName = watch("companyName");
  const logoUrl = watch("logoUrl");
  const industry = watch("industry");
  const companyBio = watch("companyBio");

  const displayName = companyName.trim() || "Your company";
  const displayIndustry = industry || "Industry";
  const bioPreview =
    companyBio?.trim() ||
    "Your company bio appears here on job posts so workers know who they're applying to.";

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      <div className={`${EMPLOYER_CARD} p-5 space-y-4`}>
        <div className="flex items-center gap-2 text-[#006e2f]">
          <Briefcase className="h-4 w-4" aria-hidden />
          <h2 className="text-sm font-bold text-slate-900">
            Worker-facing preview
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          This is how your brand appears on job listings and applicant views.
        </p>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {displayName}
              </p>
              <p className="text-xs font-semibold text-[#006e2f]">
                {displayIndustry}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
            {bioPreview}
          </p>
        </div>
      </div>

      {isProfileComplete ? (
        <div className={`${EMPLOYER_CARD} p-5 text-center space-y-3`}>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            Profile looks good — post your first job to start receiving
            applicants.
          </p>
          <PostJobCTA
            planUsage={planUsage}
            label="Post your first job"
            compact
            className="mx-auto"
          />
        </div>
      ) : null}
    </aside>
  );
}
