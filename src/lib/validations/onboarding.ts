import { z } from "zod";
import { nonEmptyStringSchema } from "./common";

export const workerOnboardingSchema = z.object({
  professionalTitle: nonEmptyStringSchema.max(100),
  location: nonEmptyStringSchema.max(120),
  skills: z.array(z.string().min(1)).min(1, "Select at least one skill").max(8),
  bio: z.string().max(500).optional(),
});

export const employerOnboardingSchema = z.object({
  companyName: nonEmptyStringSchema.max(120),
  industry: nonEmptyStringSchema,
  companySize: nonEmptyStringSchema.max(80),
  skills: z.array(z.string().min(1)).min(1, "Select at least one skill").max(8),
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  companyBio: z.string().max(500).optional(),
});
