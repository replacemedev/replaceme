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

interface CompanyProfileFormProps {
  initialData: CompanyProfileInput | null;
  industries: DropdownOption[];
  isProfileComplete?: boolean;
}

export function CompanyProfileForm({
  initialData,
  industries,
  isProfileComplete = false,
}: CompanyProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      websiteUrl: initialData?.websiteUrl || "",
      industry: initialData?.industry || "",
      companyBio: initialData?.companyBio || "",
      logoUrl: initialData?.logoUrl || "",
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

          <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/employer/dashboard")}
              className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="success"
              className="w-auto px-6 h-12 flex items-center gap-2"
            >
              <Save size={16} aria-hidden />
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>

        <CompanyJobPostPreview isProfileComplete={isProfileComplete} />
      </form>
    </FormProvider>
  );
}
