import { z } from "zod";

export const subscriptionTierSchema = z.enum(
  ["discovery", "essential", "professional"],
  { message: "Invalid subscription plan selected." }
);

export const upgradeCheckoutSchema = z.object({
  planId: subscriptionTierSchema,
});
