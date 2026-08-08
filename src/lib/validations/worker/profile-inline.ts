import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url({ message: "Please enter a valid URL." })]);
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD).");

export const workerGenderSchema = z.enum(["Male", "Female", "Other"]);

export const patchWorkerProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required.").max(80, "First name cannot exceed 80 characters."),
    middleName: z.string().max(80, "Middle name cannot exceed 80 characters.").optional().nullable(),
    lastName: z.string().min(1, "Last name is required.").max(80, "Last name cannot exceed 80 characters."),
    suffix: z.string().max(10, "Suffix cannot exceed 10 characters.").optional().nullable(),
    gender: workerGenderSchema,
    spokenLanguages: z
      .array(z.string().min(1))
      .min(1, "Add at least one spoken language.")
      .max(8),
    professionalTitle: z.string().min(2, "Professional title must be at least 2 characters.").max(120, "Professional title cannot exceed 120 characters."),
    bio: z.string().max(2000, "Bio cannot exceed 2000 characters."),
    region: z.string().max(100, "Region cannot exceed 100 characters.").optional().nullable(),
    province: z.string().max(100, "Province cannot exceed 100 characters.").optional().nullable(),
    city: z.string().max(100, "City/Municipality cannot exceed 100 characters.").optional().nullable(),
    addressLine1: z.string().max(200, "Address Line 1 cannot exceed 200 characters.").optional().nullable(),
    portfolioUrl: optionalUrl,
    resumeUrl: optionalUrl,
    cvUrl: optionalUrl,
    birthDate: isoDateSchema,
    tinNumber: z.string().optional().nullable(),
    idType: z.string().optional().nullable(),
    idNumber: z.string().optional().nullable(),
    idExpirationDate: isoDateSchema.optional().nullable(),
    idIssuingCountry: z.string().optional().nullable(),
  })
  .partial()
  .strict();

/** Full personal/demographics save from the profile edit modal (not a sparse patch). */
export const workerEditDetailsSchema = z
  .object({
    firstName: z.string().min(1, "First name is required.").max(80),
    middleName: z.string().max(80).optional().nullable(),
    lastName: z.string().min(1, "Last name is required.").max(80),
    suffix: z.string().max(10).optional().nullable(),
    birthDate: isoDateSchema,
    gender: workerGenderSchema,
    spokenLanguages: z
      .array(z.string().min(1))
      .min(1, "Add at least one spoken language.")
      .max(8),
    tinNumber: z.string().optional().nullable(),
    idType: z.string().optional().nullable(),
    idNumber: z.string().optional().nullable(),
    idExpirationDate: isoDateSchema.optional().nullable(),
    idIssuingCountry: z.string().optional().nullable(),
  })
  .strict();

export type PatchWorkerProfileInput = z.infer<typeof patchWorkerProfileSchema>;
export type WorkerEditDetailsInput = z.infer<typeof workerEditDetailsSchema>;

export const workerSkillInputSchema = z
  .object({
    skillName: z.string().min(1).max(80),
    proficiency: z.number().int().min(0).max(100),
    proficiencyLabel: z.string().min(1).max(40),
    category: z.string().max(40).optional(),
    experienceDuration: z.string().max(80).optional(),
    yearsWithSkill: z.number().int().min(0).max(60).optional(),
  })
  .strict();

export const updateWorkerSkillSchema = workerSkillInputSchema
  .extend({ id: z.string().uuid() })
  .strict();

export const jobExperienceInputSchema = z
  .object({
    companyName: z.string().min(1).max(120),
    roleTitle: z.string().min(1).max(120),
    startDate: isoDateSchema,
    endDate: isoDateSchema.nullable(),
    description: z.string().min(1).max(2000),
    skillsUsed: z.array(z.string().min(1).max(60)).max(20),
  })
  .strict();

export const updateJobExperienceSchema = jobExperienceInputSchema
  .extend({ id: z.string().uuid() })
  .strict();

export const PROFICIENCY_OPTIONS = [
  { value: 25, label: "Beginner" },
  { value: 50, label: "Intermediate" },
  { value: 75, label: "Proficient" },
  { value: 95, label: "Expert" },
] as const;
