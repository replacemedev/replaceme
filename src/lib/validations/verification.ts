import { z } from "zod";

/** Worker submits verification queue — requires explicit KYC processing consent. */
export const submitVerificationForReviewSchema = z
  .object({
    kycConsent: z.literal(true, {
      error: "You must consent to identity verification processing before submitting.",
    }),
  })
  .strict();
