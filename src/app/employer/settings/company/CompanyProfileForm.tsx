"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { companyProfileSchema, CompanyProfileInput, DropdownOption } from "@/schemas/employer/company";
import { updateCompanyProfile } from "@/actions/employer/company";
import { Button } from "@/components/ui/button";

import { LogoUpload } from "@/components/employer/settings/company/LogoUpload";
import { CompanyDetailsForm } from "@/components/employer/settings/company/CompanyDetailsForm";

interface CompanyProfileFormProps {
  initialData: CompanyProfileInput | null;
  industries: DropdownOption[];
}

export function CompanyProfileForm({ initialData, industries }: CompanyProfileFormProps) {
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
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Logo Upload Section */}
        <LogoUpload />

        {/* Divider line matching reference */}
        <div className="h-px bg-slate-100" />

        {/* Text Form Details */}
        <CompanyDetailsForm industries={industries} />

        {/* Form Footer Actions */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
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
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
