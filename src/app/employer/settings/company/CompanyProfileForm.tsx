"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { companyProfileSchema, CompanyProfileInput, DropdownOption } from "@/lib/validations/employer/company";
import { updateCompanyProfile } from "@/actions/employer/company";
import { Button } from "@/components/ui/button";

import { LogoUpload } from "@/components/employer/settings/company/LogoUpload";
import { CompanyDetailsForm } from "@/components/employer/settings/company/CompanyDetailsForm";
import { CompanyJobPostPreview } from "@/components/employer/settings/company/CompanyJobPostPreview";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

import type { EmployerPlanUsage } from "@/lib/server/entitlements";

interface CompanyProfileFormProps {
  initialData: CompanyProfileInput | null;
  industries: DropdownOption[];
  isProfileComplete?: boolean;
  planUsage?: EmployerPlanUsage | null;
}

export function CompanyProfileForm({
  initialData,
  industries,
  isProfileComplete = false,
  planUsage = null,
}: CompanyProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      websiteUrl: initialData?.websiteUrl || "",
      industry: initialData?.industry || "",
      industryCustom: initialData?.industryCustom || "",
      companyBio: initialData?.companyBio || "",
      logoUrl: initialData?.logoUrl || "",
      hiringRegions: initialData?.hiringRegions || [],
    },
  });

  const onSubmit = async (data: CompanyProfileInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const result = await updateCompanyProfile(data);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success) {
        toast.success(result.message, { id: toastId });
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start"
      >
        <div className={`${EMPLOYER_CARD} p-6 sm:p-8 space-y-8`}>
          <LogoUpload />

          <div className="h-px bg-slate-100" />

          <CompanyDetailsForm industries={industries} />

          <div className="flex w-full flex-col-reverse items-stretch gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <button
              type="button"
              onClick={() => router.push("/employer/dashboard")}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 sm:w-auto"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="success"
              className="flex h-12 items-center gap-2 px-6 sm:!w-auto"
            >
              <Save size={16} aria-hidden />
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>

        <CompanyJobPostPreview
          isProfileComplete={isProfileComplete}
          planUsage={planUsage}
        />
      </form>
    </FormProvider>
  );
}
