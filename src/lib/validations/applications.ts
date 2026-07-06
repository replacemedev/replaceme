import { z } from "zod";
import { APPLICATION_STATUSES } from "@/types/applications";
import { uuidSchema } from "./common";

export const updateApplicationStatusSchema = z.object({
  applicationId: uuidSchema,
  status: z.enum(APPLICATION_STATUSES, {
    message: "Invalid application status.",
  }),
});

export const deleteApplicationSchema = z.object({
  applicationId: uuidSchema,
});
