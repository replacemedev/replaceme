"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { submitJobApplication } from "@/actions/job-application";
import {
  CONTACT_METHOD_TYPES,
  type ApplyJobSummary,
  type ContactMethod,
  type WorkerProfileAssets,
  jobApplicationFormSchema,
  type JobApplicationFormValues,
} from "@/types/job-application";

interface ApplicationFormProps {
  job: ApplyJobSummary;
  profileAssets: WorkerProfileAssets;
  defaultContactMethods: ContactMethod[];
}

const contactTypeLabels: Record<(typeof CONTACT_METHOD_TYPES)[number], string> = {
  email: "Email",
  phone: "Phone",
};

function ProfileAssetButton({
  label,
  href,
  icon: Icon,
  trailing: Trailing,
  external,
}: {
  label: string;
  href: string | null;
  icon: typeof FileText;
  trailing: typeof Eye;
  external?: boolean;
}) {
  const baseClass =
    "flex items-center justify-between gap-3 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors";

  if (!href) {
    return (
      <div
        className={`${baseClass} opacity-50 cursor-not-allowed`}
        aria-disabled
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[#006e2f]" aria-hidden />
          {label}
        </span>
        <span className="text-[10px] font-bold uppercase text-slate-400">
          Not set
        </span>
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} hover:border-[#006e2f]/30 hover:bg-[#ebfdf2]`}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[#006e2f]" aria-hidden />
          {label}
        </span>
        <Trailing className="h-4 w-4 text-slate-400" aria-hidden />
      </a>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} hover:border-[#006e2f]/30 hover:bg-[#ebfdf2]`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-[#006e2f]" aria-hidden />
        {label}
      </span>
      <Trailing className="h-4 w-4 text-slate-400" aria-hidden />
    </Link>
  );
}

export function ApplicationForm({
  job,
  profileAssets,
  defaultContactMethods,
}: ApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobApplicationFormValues>({
    resolver: zodResolver(jobApplicationFormSchema),
    defaultValues: {
      jobId: job.id,
      applicationSubject: "",
      coverLetter: "",
      contactMethods: defaultContactMethods,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactMethods",
  });

  const onSubmit = async (data: JobApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitJobApplication(data);
      if (!result.success) {
        toast.error(result.error ?? "Could not submit application.");
        return;
      }
      setIsSuccess(true);
      toast.success("Application submitted successfully.");
      router.push("/worker/applications");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-lg font-extrabold text-[#006e2f]">
          Application submitted!
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Redirecting to your applications…
        </p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-6">
        Job Application
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <input type="hidden" {...register("jobId")} />

        <fieldset className="space-y-2">
          <label
            htmlFor="applicationSubject"
            className="block text-[11px] font-extrabold uppercase tracking-wider text-[#006e2f]"
          >
            Application Subject *
          </label>
          <Input
            id="applicationSubject"
            placeholder="e.g. Experienced Thumbnail Designer Application"
            error={errors.applicationSubject?.message}
            aria-invalid={Boolean(errors.applicationSubject)}
            {...register("applicationSubject")}
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="coverLetter"
            className="block text-[11px] font-extrabold uppercase tracking-wider text-[#006e2f]"
          >
            Cover Letter / Message *
          </label>
          <textarea
            id="coverLetter"
            rows={6}
            placeholder="Tell us why you're a great fit..."
            className={`w-full rounded-xl border ${
              errors.coverLetter
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-200 focus:ring-[#22c55e]"
            } bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-y min-h-[140px]`}
            aria-invalid={Boolean(errors.coverLetter)}
            {...register("coverLetter")}
          />
          {errors.coverLetter && (
            <p className="text-red-500 text-xs mt-1">
              {errors.coverLetter.message}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-[11px] font-extrabold uppercase tracking-wider text-[#006e2f]">
            Profile Assets
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileAssetButton
              label="View Resume"
              href={profileAssets.resumeUrl}
              icon={FileText}
              trailing={Eye}
            />
            <ProfileAssetButton
              label="Live Portfolio"
              href={profileAssets.portfolioUrl}
              icon={Globe}
              trailing={ExternalLink}
              external
            />
          </div>
        </fieldset>

        {job.skills.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-extrabold uppercase tracking-wider text-[#006e2f]">
              Skills Requirement
            </legend>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-[#ebfdf2] border border-[#006e2f]/20 px-3 py-1 text-xs font-bold text-[#006e2f]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="rounded-2xl border border-[#006e2f]/20 bg-[#f6fdf9] p-4 sm:p-5 space-y-4">
          <legend className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#006e2f] px-1">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Contact Details
          </legend>

          {errors.contactMethods?.message && (
            <p className="text-red-500 text-xs">{errors.contactMethods.message}</p>
          )}

          <ul className="space-y-3">
            {fields.map((field, index) => (
              <li key={field.id} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#22c55e] sm:w-36 shrink-0"
                  {...register(`contactMethods.${index}.type`)}
                >
                  {CONTACT_METHOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {contactTypeLabels[type]}
                    </option>
                  ))}
                </select>

                <div className="flex-1 min-w-0">
                  <Input
                    placeholder={
                      field.type === "phone"
                        ? "+1 234 567 8900"
                        : "user.professional@email.com"
                    }
                    error={errors.contactMethods?.[index]?.value?.message}
                    aria-invalid={Boolean(
                      errors.contactMethods?.[index]?.value
                    )}
                    {...register(`contactMethods.${index}.value`)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  aria-label="Remove contact method"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => append({ type: "email", value: "" })}
            disabled={fields.length >= 5}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#006e2f] hover:text-[#005c26] disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add Contact Method
          </button>
        </fieldset>

        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-extrabold uppercase tracking-wide shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </article>
  );
}
