import { z } from "zod";
import { uuidSchema } from "@/lib/validations/common";
import { salaryCurrencySchema } from "@/lib/validations/onboarding";
import { ORDERED_SKILLS } from "@/data/skills";

const allowedSkillSchema = z
  .string()
  .refine(
    (skill) => ORDERED_SKILLS.some((s) => s.toLowerCase() === skill.toLowerCase()),
    "Select a skill from the catalog"
  );

export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(3, "Job title must be at least 3 characters")
      .max(100, "Job title must be less than 100 characters"),
    employmentType: z.string().min(1, "Please select an employment type"),
    description: z
      .string()
      .min(10, "Job description must be at least 10 characters"),
    salaryCurrency: salaryCurrencySchema,
    hourlyRate: z.number().min(1, "Hourly rate must be at least 1"),
    monthlySalary: z.number().min(100, "Monthly salary must be at least 100"),
    hoursPerWeek: z
      .number()
      .min(1, "Hours per week must be at least 1")
      .max(168, "Hours per week cannot exceed 168"),
    skills: z
      .array(allowedSkillSchema)
      .min(1, "Please select at least 1 skill")
      .max(5, "You can select up to 5 skills"),
    notificationPreference: z.enum(["daily", "immediate"]),
    intent: z.enum(["standard", "premium"]),
  })
  .strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema
  .extend({
    jobId: uuidSchema,
  })
  .strict();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const jobIdSchema = z.object({ jobId: uuidSchema }).strict();
export const trackJobViewSchema = jobIdSchema;

export interface DropdownOption {
  label: string;
  value: string;
}
