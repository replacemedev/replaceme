/**
 * @deprecated Do not use for employer Manage Plan / checkout.
 * Use `createPlanChangeSession` (Checkout or Portal confirm URL) instead.
 * Re-exports kept only for emergency/admin tooling.
 */
export {
  changeEmployerSubscription,
  upgradeExistingSubscription,
  type ChangeSubscriptionResult,
} from "@/lib/server/stripe/change-subscription";
