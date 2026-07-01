import { z } from "zod";
import { accountStatusSchema } from "@/types/admin.types";

export const adminRoleSchema = z.enum(["moderator", "superadmin"]);

export const createAdminSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(12, "Temporary password must be at least 12 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    admin_role: adminRoleSchema.default("moderator"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateAdminStatusSchema = z.object({
  userId: z.string().uuid(),
  status: accountStatusSchema,
  reason: z.string().min(3).max(500).optional(),
});

export const updateAdminRoleSchema = z.object({
  userId: z.string().uuid(),
  admin_role: adminRoleSchema,
});

export const adminTeamUserIdSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminStatusInput = z.infer<typeof updateAdminStatusSchema>;
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>;
