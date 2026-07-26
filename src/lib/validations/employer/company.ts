import { z } from "zod";
import { HIRING_REGION_VALUES } from "@/lib/data/industries";

const hiringRegionSet = new Set<string>(HIRING_REGION_VALUES);

export const companyProfileSchema = z
  .object({
    companyName: z.string().min(1, "Company Name is required"),
    websiteUrl: z
      .union([
        z.string().url("Please enter a valid URL (e.g. https://example.com)"),
        z.literal(""),
      ])
      .optional(),
    industry: z.string().min(1, "Please select an industry"),
    companyBio: z
      .string()
      .max(500, "Bio cannot exceed 500 characters")
      .optional(),
    logoUrl: z.string().optional(),
    hiringRegions: z.array(z.string()).max(8).optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    hiringRegions: (data.hiringRegions ?? []).filter((r) =>
      hiringRegionSet.has(r)
    ),
  }));

export type CompanyProfileInput = z.input<typeof companyProfileSchema>;
export type CompanyProfileParsed = z.output<typeof companyProfileSchema>;

export interface DropdownOption {
  label: string;
  value: string;
}
