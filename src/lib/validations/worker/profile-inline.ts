import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url({ message: "Please enter a valid URL." })]);
const currentYear = new Date().getFullYear();

export const patchWorkerProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required.").max(80, "First name cannot exceed 80 characters."),
    middleName: z.string().max(80, "Middle name cannot exceed 80 characters.").optional().nullable(),
    lastName: z.string().min(1, "Last name is required.").max(80, "Last name cannot exceed 80 characters."),
    suffix: z.string().max(10, "Suffix cannot exceed 10 characters.").optional().nullable(),
    phoneNumber: z.string().min(5, "Phone number must be at least 5 characters.").max(25, "Phone number cannot exceed 25 characters.").optional().nullable(),
    gender: z.string().optional().nullable(),
    civilStatus: z.string().optional().nullable(),
    preferredLanguage: z.string().optional().nullable(),
    professionalTitle: z.string().min(2, "Professional title must be at least 2 characters.").max(120, "Professional title cannot exceed 120 characters."),
    bio: z.string().max(2000, "Bio cannot exceed 2000 characters."),
    region: z.string().max(100, "Region cannot exceed 100 characters.").optional().nullable(),
    province: z.string().max(100, "Province cannot exceed 100 characters.").optional().nullable(),
    city: z.string().max(100, "City/Municipality cannot exceed 100 characters.").optional().nullable(),
    addressLine1: z.string().max(200, "Address Line 1 cannot exceed 200 characters.").optional().nullable(),
    portfolioUrl: optionalUrl,
    resumeUrl: optionalUrl,
    cvUrl: optionalUrl,
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid birthdate (YYYY-MM-DD).").nullable(),
    tinNumber: z.string().optional().nullable(),
    sssNumber: z.string().optional().nullable(),
    philhealthNumber: z.string().optional().nullable(),
    pagibigNumber: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactRelationship: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    idType: z.string().optional().nullable(),
    idNumber: z.string().optional().nullable(),
    idExpirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD).").optional().nullable(),
    idIssuingCountry: z.string().optional().nullable(),
  })
  .partial()
  .strict();

export type PatchWorkerProfileInput = z.infer<typeof patchWorkerProfileSchema>;

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

export const workerProjectInputSchema = z
  .object({
    title: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    year: z.number().int().min(1970).max(currentYear + 1),
    description: z.string().min(1).max(2000),
    skillsUsed: z.array(z.string().min(1).max(60)).max(20),
  })
  .strict();

export const updateWorkerProjectSchema = workerProjectInputSchema
  .extend({ id: z.string().uuid() })
  .strict();

export const PROFICIENCY_OPTIONS = [
  { value: 25, label: "Beginner" },
  { value: 50, label: "Intermediate" },
  { value: 75, label: "Proficient" },
  { value: 95, label: "Expert" },
] as const;
