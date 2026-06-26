"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createJobSchema,
  CreateJobInput,
  DropdownOption,
} from "@/lib/validations/employer/jobs";
import { createJobPost, updateJobPost } from "@/actions/employer/jobs";

import { JobBasicsSection } from "@/components/employer/jobs/create/JobBasicsSection";
import { JobRequirementsSection } from "@/components/employer/jobs/create/JobRequirementsSection";
import { JobPreferencesSection } from "@/components/employer/jobs/create/JobPreferencesSection";
import { SubmissionCards } from "@/components/employer/jobs/create/SubmissionCards";

interface EditJobValues {
  id: string;
  title: string;
  employmentType: string;
  description: string;
  monthlySalary: number;
  hoursPerWeek: number;
  skills: string[];
}

interface CreateJobFormProps {
  employmentTypes: DropdownOption[];
  skillsOptions: DropdownOption[];
  editJob?: EditJobValues | null;
}

export function CreateJobForm({
  employmentTypes,
  skillsOptions,
  editJob,
}: CreateJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(editJob);

  const methods = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: editJob
      ? {
          title: editJob.title,
          employmentType: editJob.employmentType,
          description: editJob.description,
          monthlySalary: editJob.monthlySalary,
          hoursPerWeek: editJob.hoursPerWeek,
          skills: editJob.skills,
          notificationPreference: "daily",
          intent: "standard",
        }
      : {
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
    const toastId = toast.loading(
      isEditMode ? "Saving job changes..." : "Submitting your job post..."
    );

    try {
      const result = isEditMode
        ? await updateJobPost({ ...data, jobId: editJob!.id })
        : await createJobPost(data);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success) {
        toast.success(result.message, { id: toastId });
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
          router.refresh();
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-10">
        <JobBasicsSection employmentTypes={employmentTypes} />
        <JobRequirementsSection skillsOptions={skillsOptions} />
        {!isEditMode ? <JobPreferencesSection /> : null}
        <SubmissionCards isSubmitting={isSubmitting} editMode={isEditMode} />
      </form>
    </FormProvider>
  );
}
