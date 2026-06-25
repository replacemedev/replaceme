import { z } from "zod";

export const planIdSchema = z.object({
  planId: z
    .string()
    .trim()
    .min(1, "Plan is required.")
    .refine(
      (id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id
        ) || /^[a-z0-9_-]+$/i.test(id),
      "Invalid plan identifier."
    ),
});

export const paymentIntentIdSchema = z.object({
  paymentIntentId: z.string().trim().min(1, "Payment intent is required."),
});
