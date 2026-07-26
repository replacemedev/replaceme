import { z } from "zod";
import { USER_REPORT_VIOLATIONS } from "@/lib/reporting/constants";

export const reportWorkerSchema = z
  .object({
    title: z.string().min(5).max(120),
    description: z.string().min(10).max(2000),
    violationCategory: z.enum(USER_REPORT_VIOLATIONS),
    workerId: z.string().uuid(),
    jobId: z.string().uuid().optional(),
  })
  .strict();
