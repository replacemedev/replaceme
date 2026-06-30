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
  professionalTitle: nonEmptyStringSchema.max(100),
  firstName: nonEmptyStringSchema.max(80),
  lastName: nonEmptyStringSchema.max(80),
});

export const workerLocationStepSchema = z.object({
  location: nonEmptyStringSchema.max(120),
  availability: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Not available",
  ]),
  isRemote: z.boolean(),
});

export const workerSkillsStepSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .min(1, "Select at least one skill")
    .max(8),
});

export const workerCompensationStepSchema = z.object({
  hourlyRate: z.number().min(0).max(999_999).nullable().optional(),
  salaryCurrency: salaryCurrencySchema.default("PHP"),
  expectedSalaryMin: z.number().min(0).max(99_999_999).nullable().optional(),
  expectedSalaryMax: z.number().min(0).max(99_999_999).nullable().optional(),
});

export const workerAboutStepSchema = z.object({
  bio: z.string().max(2000).optional(),
  birthYear: z
    .number()
    .int()
    .min(1940)
    .max(currentYear)
    .nullable()
    .optional(),
});

export const workerProjectStepSchema = z.object({
  title: nonEmptyStringSchema.max(120),
  role: nonEmptyStringSchema.max(120),
  year: z.number().int().min(1970).max(currentYear + 1),
  description: nonEmptyStringSchema.max(2000),
  skillsUsed: z.array(z.string().min(1).max(60)).max(20),
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
