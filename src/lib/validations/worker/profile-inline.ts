import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url({ message: "Please enter a valid URL." })]);
const currentYear = new Date().getFullYear();

export const patchWorkerProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required.").max(80, "First name cannot exceed 80 characters."),
    middleName: z.string().max(80, "Middle name cannot exceed 80 characters.").optional(),
    lastName: z.string().min(1, "Last name is required.").max(80, "Last name cannot exceed 80 characters."),
    professionalTitle: z.string().min(2, "Professional title must be at least 2 characters.").max(120, "Professional title cannot exceed 120 characters."),
    bio: z.string().max(2000, "Bio cannot exceed 2000 characters."),
    location: z.string().max(120, "Location cannot exceed 120 characters."),
    portfolioUrl: optionalUrl,
    resumeUrl: optionalUrl,
    cvUrl: optionalUrl,
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid birthdate (YYYY-MM-DD).").nullable(),
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
