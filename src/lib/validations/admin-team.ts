import { z } from "zod";
import {
  ADMIN_CAPABILITIES,
  GRANTABLE_MODERATOR_CAPABILITIES,
} from "@/lib/admin/capabilities";
import { accountStatusSchema } from "@/types/admin.types";

export const adminRoleSchema = z.enum(["moderator", "superadmin"]);

export const adminCapabilitySchema = z.enum(
  ADMIN_CAPABILITIES as unknown as [string, ...string[]]
);

const grantableSet = new Set<string>(GRANTABLE_MODERATOR_CAPABILITIES);

export const inviteAdminSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    fullName: z.string().min(2, "Full name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    admin_role: adminRoleSchema.default("moderator"),
    capabilities: z.array(adminCapabilitySchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.admin_role === "superadmin") return;
    const invalid = data.capabilities.filter((c) => !grantableSet.has(c));
    if (invalid.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilities"],
        message: "One or more capabilities cannot be granted to moderators.",
      });
    }
  });

/** @deprecated Use inviteAdminSchema — password handoff removed. */
export const createAdminSchema = inviteAdminSchema;

export const updateAdminStatusSchema = z.object({
  userId: z.string().uuid(),
  status: accountStatusSchema,
  reason: z.string().min(3).max(500).optional(),
});

export const updateAdminRoleSchema = z.object({
  userId: z.string().uuid(),
  admin_role: adminRoleSchema,
});

export const updateAdminCapabilitiesSchema = z.object({
  userId: z.string().uuid(),
  admin_role: adminRoleSchema,
  capabilities: z.array(adminCapabilitySchema),
});

export const adminTeamUserIdSchema = z.object({
  userId: z.string().uuid(),
});

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
export type CreateAdminInput = InviteAdminInput;
export type UpdateAdminStatusInput = z.infer<typeof updateAdminStatusSchema>;
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>;
export type UpdateAdminCapabilitiesInput = z.infer<
  typeof updateAdminCapabilitiesSchema
>;
