import { z } from "zod";
import { formatMoney } from "@/lib/format/currency";

export const CONTACT_METHOD_TYPES = ["email", "phone"] as const;
export type ContactMethodType = (typeof CONTACT_METHOD_TYPES)[number];

export const contactMethodSchema = z
  .object({
    type: z.string().min(1, "Contact type is required"),
    customType: z.string().optional(),
    value: z
      .string()
      .trim()
      .min(1, "Contact value is required")
      .max(200, "Contact value is too long"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "other" && (!data.customType || data.customType.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom contact method name is required",
        path: ["customType"],
      });
    }
  });

export const jobApplicationFormSchema = z.object({
  jobId: z.string().uuid("Invalid job"),
  applicationSubject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be 200 characters or fewer"),
  coverLetter: z
    .string()
    .trim()
    .min(50, "Cover letter must be at least 50 characters")
    .max(5000, "Cover letter must be 5000 characters or fewer"),
  contactMethods: z
    .array(contactMethodSchema)
    .min(1, "Add at least one contact method")
    .max(5, "Maximum 5 contact methods"),
});

export type JobApplicationFormValues = z.infer<typeof jobApplicationFormSchema>;
export type ContactMethod = z.infer<typeof contactMethodSchema>;

export interface WorkerProfileAssets {
  resumeUrl: string | null;
  portfolioUrl: string | null;
  cvUrl: string | null;
}

export interface ApplyJobSummary {
  id: string;
  title: string;
  companyName: string;
  categoryBadge: string;
  employmentType: string;
  monthlySalary: number;
  salaryCurrency: string;
  hoursPerWeek: number;
  skills: string[];
  createdAt: string;
}

export interface ApplyJobPageData {
  job: ApplyJobSummary;
  profileAssets: WorkerProfileAssets;
  defaultContactMethods: ContactMethod[];
  hasApplied: boolean;
}

export function deriveJobCategoryBadge(
  skills: string[],
  employmentType: string
): string {
  if (skills.length > 0) {
    return skills[0].toUpperCase();
  }
  const normalized = employmentType.trim();
  return normalized ? normalized.toUpperCase() : "GENERAL";
}

export function formatMonthlySalary(
  monthlySalary: number,
  currency: string = "PHP"
): string {
  return `${formatMoney(monthlySalary, currency)}/mo`;
}

export function formatHoursPerWeek(hours: number): string {
  return hours > 0 ? `${hours}h/wk` : "Flexible";
}

export function formatPostedShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function buildDefaultContactMethods(profile: {
  email: string | null;
  phone_number: string | null;
}): ContactMethod[] {
  const methods: ContactMethod[] = [];
  if (profile.email?.trim()) {
    methods.push({ type: "email", value: profile.email.trim() });
  }
  if (profile.phone_number?.trim()) {
    methods.push({ type: "phone", value: profile.phone_number.trim() });
  }
  return methods.length > 0
    ? methods
    : [{ type: "email", value: "" }];
}

export const MESSAGE_GUIDE_TIPS = [
  "Be concise and clear",
  "Highlight relevant experience",
  "State your availability",
] as const;
