import type Stripe from "stripe";
import { getStripe } from "@/lib/server/stripe/client";
import {
  resolveBillingPlan,
  resolveBillingPlanByStripePriceId,
} from "@/lib/server/stripe/plan";
import { extractSubscriptionPeriod } from "@/lib/server/stripe/subscription-price";
import { safeError, safeLog } from "@/utils/logger";

export type PendingPlanChange = {
  scheduledPlanSlug: string | null;
  scheduledEffectiveAt: string | null;
};

function toIso(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function priceIdFromPhaseItem(
  item: Stripe.SubscriptionSchedule.Phase.Item | undefined
): string | null {
  if (!item?.price) return null;
  return typeof item.price === "string" ? item.price : item.price.id;
}

async function resolveSlugFromPriceId(
  priceId: string
): Promise<string | null> {
  const byPrice = await resolveBillingPlanByStripePriceId(priceId);
  if (byPrice?.slug) return byPrice.slug;

  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount;
    const byAmount: Record<number, string> = {
      1900: "starter",
      3900: "growth",
      7900: "scale",
    };
    if (amount != null && byAmount[amount]) {
      const plan = await resolveBillingPlan(byAmount[amount]!);
      return plan?.slug ?? byAmount[amount]!;
    }
  } catch (err) {
    safeError("[Stripe] pending schedule price resolve failed", err);
  }
  return null;
}

/**
 * Derive DB pending fields from live Stripe state:
 * cancel_at_period_end → Discovery at period end
 * Subscription Schedule future phase → scheduled paid tier
 * metadata.scheduled_plan_slug → last-resort fallback
 */
export async function resolvePendingPlanChange(
  subscription: Stripe.Subscription,
  livePlanSlug: string | null
): Promise<PendingPlanChange> {
  const period = extractSubscriptionPeriod(subscription);
  const periodEndIso = toIso(period.end);
  const live = (livePlanSlug ?? "").toLowerCase();

  if (subscription.cancel_at_period_end) {
    return {
      scheduledPlanSlug: "discovery",
      scheduledEffectiveAt: periodEndIso,
    };
  }

  const scheduleRef = subscription.schedule;
  if (scheduleRef) {
    const stripe = getStripe();
    if (stripe) {
      const scheduleId =
        typeof scheduleRef === "string" ? scheduleRef : scheduleRef.id;
      try {
        const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
        if (
          schedule.status === "active" ||
          schedule.status === "not_started"
        ) {
          const now = Math.floor(Date.now() / 1000);
          const currentEnd = schedule.current_phase?.end_date ?? period.end ?? now;
          const nextPhase =
            schedule.phases.find((p) => p.start_date >= currentEnd) ??
            schedule.phases.find((p) => p.start_date > now) ??
            null;

          const nextPriceId = priceIdFromPhaseItem(nextPhase?.items?.[0]);
          if (nextPriceId && nextPhase) {
            const nextSlug = await resolveSlugFromPriceId(nextPriceId);
            if (nextSlug && nextSlug.toLowerCase() !== live) {
              safeLog(
                `[Stripe] Pending schedule ${scheduleId} → ${nextSlug} at ${nextPhase.start_date}`
              );
              return {
                scheduledPlanSlug: nextSlug,
                scheduledEffectiveAt: toIso(nextPhase.start_date) ?? periodEndIso,
              };
            }
          }
        }
      } catch (err) {
        safeError("[Stripe] subscriptionSchedules.retrieve failed", err);
      }
    }
  }

  const metaSlug = subscription.metadata?.scheduled_plan_slug?.trim() || null;
  if (metaSlug && metaSlug.toLowerCase() !== live) {
    return {
      scheduledPlanSlug: metaSlug,
      scheduledEffectiveAt: periodEndIso,
    };
  }

  return { scheduledPlanSlug: null, scheduledEffectiveAt: null };
}
