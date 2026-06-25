import { z } from "zod";

/** Worker submits verification queue — no client payload; strict empty object. */
export const submitVerificationForReviewSchema = z.object({}).strict();
