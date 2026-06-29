import { z } from "zod";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";

export const cookieConsentActionSchema = z.enum([
  "accept_all",
  "reject_non_essential",
  "save_preferences",
  "withdraw",
]);

export const saveCookieConsentSchema = z
  .object({
    action: cookieConsentActionSchema,
    analytics: z.boolean(),
    marketing: z.boolean(),
    policyVersion: z.literal(COOKIE_POLICY_VERSION),
    anonymousId: z.string().min(1).max(128).optional(),
  })
  .strict();

export type SaveCookieConsentInput = z.infer<typeof saveCookieConsentSchema>;
