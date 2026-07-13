import { z } from "zod";
import { APPLICATION_STATUSES } from "@/types/applications";
import { uuidSchema } from "./common";

export const updateApplicationStatusSchema = z.object({
  applicationId: uuidSchema,
  status: z.enum(APPLICATION_STATUSES, {
    message: "Invalid application status.",
  }),
  employmentStatus: z.string().optional().nullable(),
  showHiredBadge: z.boolean().optional(),
});

export const deleteApplicationSchema = z.object({
  applicationId: uuidSchema,
});
