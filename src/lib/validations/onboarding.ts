import { z } from "zod";
import { nonEmptyStringSchema } from "./common";

export const salaryCurrencySchema = z.enum([
  "PHP",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "SGD",
  "CAD",
]);

const currentYear = new Date().getFullYear();

export const workerIdentityStepSchema = z.object({
  professionalTitle: nonEmptyStringSchema.max(100, "Professional title cannot exceed 100 characters."),
  firstName: nonEmptyStringSchema.max(80, "First name cannot exceed 80 characters."),
  middleName: z.string().max(80, "Middle name cannot exceed 80 characters.").optional(),
  lastName: nonEmptyStringSchema.max(80, "Last name cannot exceed 80 characters."),
});

export const workerLocationStepSchema = z.object({
  region: nonEmptyStringSchema.max(100, "Region cannot exceed 100 characters."),
  province: nonEmptyStringSchema.max(100, "Province cannot exceed 100 characters."),
  city: nonEmptyStringSchema.max(100, "City/Municipality cannot exceed 100 characters."),
  addressLine1: z.string().max(200, "Address Line 1 cannot exceed 200 characters.").optional(),
  availability: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Not available",
  ], {
    message: "Please select a valid availability option.",
  }),
  isRemote: z.boolean(),
});

export const workerSkillsStepSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .min(1, "Select at least one skill.")
    .max(8, "You can select up to 8 skills."),
});

export const workerCompensationStepSchema = z.object({
  hourlyRate: z
    .number({ message: "Hourly rate must be a number." })
    .min(0, "Hourly rate cannot be negative.")
    .max(999_999, "Hourly rate exceeds the maximum limit.")
    .nullable()
    .optional(),
  salaryCurrency: salaryCurrencySchema.default("PHP"),
  expectedSalaryMin: z
    .number({ message: "Expected minimum salary must be a number." })
    .min(0, "Minimum salary cannot be negative.")
    .max(99_999_999, "Minimum salary exceeds the maximum limit.")
    .nullable()
    .optional(),
  expectedSalaryMax: z
    .number({ message: "Expected maximum salary must be a number." })
    .min(0, "Maximum salary cannot be negative.")
    .max(99_999_999, "Maximum salary exceeds the maximum limit.")
    .nullable()
    .optional(),
});

export const workerAboutStepSchema = z.object({
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters.").optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid birthdate (YYYY-MM-DD).")
    .nullable()
    .optional(),
});

export const workerProjectStepSchema = z.object({
  title: nonEmptyStringSchema.max(120, "Project title cannot exceed 120 characters."),
  role: nonEmptyStringSchema.max(120, "Role cannot exceed 120 characters."),
  year: z
    .number({ message: "Project year must be a number." })
    .int("Project year must be a whole number.")
    .min(1970, "Project year must be 1970 or later.")
    .max(currentYear + 1, "Project year cannot be in the far future."),
  description: nonEmptyStringSchema.max(2000, "Project description cannot exceed 2000 characters."),
  skillsUsed: z.array(z.string().min(1)).max(20, "You can specify up to 20 skills."),
});

/** @deprecated Use per-step schemas — kept for legacy callers */
export const workerOnboardingSchema = z.object({
  professionalTitle: nonEmptyStringSchema.max(100),
  location: nonEmptyStringSchema.max(120),
  skills: z.array(z.string().min(1)).min(1, "Select at least one skill").max(8),
  bio: z.string().max(500).optional(),
});

export const employerCompanyStepSchema = z.object({
  companyName: nonEmptyStringSchema.max(120),
  industry: nonEmptyStringSchema,
  companySize: nonEmptyStringSchema.max(80),
});

export const employerHiringStepSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .min(1, "Select at least one skill")
    .max(8),
});

export const employerDetailsStepSchema = z.object({
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  companyBio: z.string().max(500).optional(),
});

export const employerOnboardingSchema = z.object({
  companyName: nonEmptyStringSchema.max(120),
  industry: nonEmptyStringSchema,
  companySize: nonEmptyStringSchema.max(80),
  skills: z.array(z.string().min(1)).min(1, "Select at least one skill").max(8),
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  companyBio: z.string().max(500).optional(),
});

export type WorkerOnboardingStep =
  | "identity"
  | "location"
  | "skills"
  | "compensation"
  | "about"
  | "project";

export type EmployerOnboardingStep = "company" | "hiring" | "details";
