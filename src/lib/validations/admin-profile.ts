import { z } from "zod";

export const updateAdminSelfProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(80, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(80, "Last name is too long"),
  phoneNumber: z
    .string()
    .trim()
    .max(32, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  department: z
    .string()
    .trim()
    .max(80, "Department is too long")
    .optional()
    .or(z.literal("")),
  displayName: z
    .string()
    .trim()
    .max(120, "Display name is too long")
    .optional()
    .or(z.literal("")),
  timezone: z
    .string()
    .trim()
    .max(64, "Timezone is too long")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  directoryPublic: z.boolean().optional(),
});

export type UpdateAdminSelfProfileInput = z.infer<
  typeof updateAdminSelfProfileSchema
>;
