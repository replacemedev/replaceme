import { z } from "zod";
import { uuidSchema } from "./common";

export const unlockCandidateSchema = z.object({
  applicationId: uuidSchema,
});

export const jobIdParamSchema = z.object({
  jobId: uuidSchema,
});
