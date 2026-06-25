"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createJobSchema, CreateJobInput, DropdownOption } from "@/lib/validations/employer/jobs";
import { createJobPost } from "@/actions/employer/jobs";

// Form Sections
import { JobBasicsSection } from "@/components/employer/jobs/create/JobBasicsSection";
import { JobRequirementsSection } from "@/components/employer/jobs/create/JobRequirementsSection";
import { JobPreferencesSection } from "@/components/employer/jobs/create/JobPreferencesSection";
import { SubmissionCards } from "@/components/employer/jobs/create/SubmissionCards";

interface CreateJobFormProps {
  employmentTypes: DropdownOption[];
  skillsOptions: DropdownOption[];
}

export function CreateJobForm({ employmentTypes, skillsOptions }: CreateJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      employmentType: "",
      description: "",
      monthlySalary: 5000,
      hoursPerWeek: 40,
      skills: [],
      notificationPreference: "daily",
      intent: "standard",
    },
  });

  const onSubmit = async (data: CreateJobInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your job post...");

    try {
      const result = await createJobPost(data);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success) {
        toast.success(result.message, { id: toastId });
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-10">
        {/* Step 1: Basics */}
        <JobBasicsSection employmentTypes={employmentTypes} />

        {/* Step 2: Requirements & Salary */}
        <JobRequirementsSection skillsOptions={skillsOptions} />

        {/* Step 3: Preferences & Matching */}
        <JobPreferencesSection />

        {/* Step 4: Submission cards / Actions */}
        <SubmissionCards isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
}
