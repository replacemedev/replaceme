import { z } from "zod";

export const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  websiteUrl: z.union([
    z.string().url("Please enter a valid URL (e.g. https://example.com)"),
    z.literal(""),
  ]).optional(),
  industry: z.string().min(1, "Please select an industry"),
  companyBio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  logoUrl: z.string().optional(),
}).strict(); // strict validation to drop unexpected fields

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export interface DropdownOption {
  label: string;
  value: string;
}
